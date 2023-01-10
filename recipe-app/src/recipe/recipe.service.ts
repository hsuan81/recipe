import { Injectable } from '@nestjs/common'
import {
  Ingredient as PrismaIngredient,
  NumIngredientOnRecipe as PrismaNumIngredientOnRecipe,
  Recipe as PrismaRecipe,
} from '@prisma/client'
import { truncate } from 'fs'
import { S3Service } from 'src/s3/s3.service'
import { stream2buffer } from 'src/util/stream2buffer'
// import { Recipe } from '../graphql.schema';
import { PrismaService } from '../prisma/prisma.service'
import { RecipeInput, RecipeStepInput } from './dto/create-recipe.dto'
import { Difficulty } from './enum/difficulty.enum'
// import { RecipeInput, IngredientNumInput } from './dto/create-recipe.dto';
import { Recipe, IngredientNum, RecipeStep } from './models/recipe.model'
import { RecipeSummary } from './models/recipeSummary.model'

// export type GQLRecipe = {
//   id: string,
//   title: string,
//   authorId: string,
//   ingredients: GQLIngredient[],
//   instructions: string[],
//   updatedAt: Date,
// }

// export type GQLIngredient = {
//   ingredientId: string,
//   recipeId: string,
//   name: string,
//   unit: string,
//   value: string,
// }

export type RecipeDetailsPrisma = PrismaRecipe & {
  ingredientsNum: (PrismaNumIngredientOnRecipe & {
    ingredient: PrismaIngredient
  })[]
  author: {
    name: string
  }
}

@Injectable()
export class RecipeService {
  constructor(private prisma: PrismaService, private s3Service: S3Service) {}

  async create(content: RecipeInput): Promise<Recipe> {
    // create or retrieve ingredients
    let ingredientsOnRecipe = []
    for (let i of content.ingredientsNum) {
      const ingredient = await this.prisma.ingredient.findUnique({
        where: {
          name: i.name,
        },
      })
      if (!ingredient) {
        const createdIngredient = await this.prisma.ingredient.create({
          data: {
            name: i.name,
          },
        })
        ingredientsOnRecipe.push({
          ingredientId: createdIngredient.id,
          // name: i.name,
          unit: i.unit,
          value: i.value,
        })
      } else
        ingredientsOnRecipe.push({
          ingredientId: ingredient.id,
          // name: i.name,
          unit: i.unit,
          value: i.value,
        })
    }

    const author = await this.prisma.user.findUniqueOrThrow({
      where: { name: content.authorName },
    })

    const createdRecipe = await this.prisma.recipe.create({
      data: {
        ...content,
        author: {
          connect: { id: author.id },
        },
        ingredientsNum: {
          createMany: {
            data: ingredientsOnRecipe,
          },
        },
        instructions:
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
        ingredientsNum: {
          include: {
            ingredient: true,
          },
        },
      },
    })
    return this._parseRecipe(createdRecipe)
  }

  async findById(id: string): Promise<RecipeSummary> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
          },
        },
        ingredientsNum: {
          include: {
            ingredient: true,
          },
        },
      },
    })
    if (recipe === null) {
      throw new Error('Recipe not found')
    }
    return this._parseSummary(recipe)
  }

  async favorite(userId: string, recipeId: string): Promise<Recipe> {
    let recipe = await this.prisma.recipe.findUniqueOrThrow({
      where: { id: recipeId },
      include: {
        author: {
          select: {
            name: true,
          },
        },
        ingredientsNum: {
          include: {
            ingredient: true,
          },
        },
      },
    })
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { favorite: { include: { recipes: true } } },
    })

    // create favorite if the user doesn't have one
    if (!user.favorite) {
      await this.prisma.favorite.create({
        data: {
          user: { connect: { id: userId } },
        },
      })
    }

    const isNewFavorite =
      user.favorite &&
      user.favorite.recipes.findIndex(_recipe => _recipe.id === recipe.id) < 0

    if (isNewFavorite) {
      await this.prisma.favorite.update({
        where: { id: user.favorite?.id },
        data: {
          recipes: { connect: { id: recipeId } },
        },
      })
      // const newLikesNum = ++recipe.likesNum
      ++recipe.likesNum
      console.log(recipe.likesNum)

      const updatedRecipe = await this.prisma.recipe.update({
        where: { id: recipeId },
        data: {
          // likesNum: newLikesNum,
          likesNum: recipe.likesNum,
        },
        include: {
          author: {
            select: {
              name: true,
            },
          },
          ingredientsNum: {
            include: {
              ingredient: true,
            },
          },
        },
      })
      return this._parseRecipe(updatedRecipe, true, undefined)
    }

    return this._parseRecipe(recipe)
  }

  async unFavorite(userId: string, recipeId: string): Promise<Recipe> {
    let recipe = await this.prisma.recipe.findUniqueOrThrow({
      where: { id: recipeId },
      include: {
        author: {
          select: {
            name: true,
          },
        },
        ingredientsNum: {
          include: {
            ingredient: true,
          },
        },
      },
    })
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { favorite: { include: { recipes: true } } },
    })

    const deleteIndex =
      user.favorite &&
      user.favorite?.recipes.findIndex(_recipe => _recipe.id === recipe.id)

    if (typeof deleteIndex === 'number' && deleteIndex >= 0) {
      // user.favorite?.recipes.splice(deleteIndex, 1)
      await this.prisma.favorite.update({
        where: { id: user.favorite?.id },
        data: {
          recipes: { disconnect: { id: recipeId } },
        },
      })
      recipe.likesNum--
      // let newLikesNum = recipe.likesNum

      // console.log(recipe.likesNum)

      const updatedRecipe = await this.prisma.recipe.update({
        where: { id: recipeId },
        data: {
          likesNum: recipe.likesNum,
        },
        include: {
          author: {
            select: {
              name: true,
            },
          },
          ingredientsNum: {
            include: {
              ingredient: true,
            },
          },
        },
      })
      return this._parseRecipe(updatedRecipe, false, undefined)
    }

    return this._parseRecipe(recipe)
  }

  async getByTags(tags: string[], afterId?: string): Promise<RecipeSummary[]> {
    const recipesfromDB = await this.prisma.recipe.findMany({
      where: {
        tags: {
          hasEvery: tags,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            name: true,
          },
        },
        ingredientsNum: {
          include: {
            ingredient: true,
          },
        },
      },
      cursor: afterId ? { id: afterId } : undefined,
      take: 20,
      skip: afterId ? 1 : 0,
    })
    const recipes = recipesfromDB.map(e => {
      return this._parseSummary(e)
    })
    return recipes
  }

  async getLatest(afterId?: string): Promise<RecipeSummary[]> {
    const recipesfromDB = await this.prisma.recipe.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            name: true,
          },
        },
        ingredientsNum: {
          include: {
            ingredient: true,
          },
        },
      },
      cursor: afterId ? { id: afterId } : undefined,
      take: 20,
      skip: afterId ? 1 : 0,
    })

    const recipes = recipesfromDB.map(e => {
      return this._parseSummary(e)
    })
    return recipes
  }

  async update(id: string, content: RecipeInput): Promise<Recipe> {
    /* 
    case1: update the content of recipe, like title, instructions
    case2: update existing ingredients info
    case3: add new ingredients that are created in the ingredient list
    case4: add new ingredients that are in the ingredient list
    */
    for (let n of content.ingredientsNum) {
      if (n.recipeId && n.ingredientId) {
        await this.prisma.numIngredientOnRecipe.update({
          where: {
            recipeId_ingredientId: {
              recipeId: n.recipeId,
              ingredientId: n.ingredientId,
            },
          },
          data: {
            unit: n.unit,
            value: n.value,
          },
        })
      } else {
        await this.prisma.ingredient.upsert({
          where: { name: n.name },
          create: {
            name: n.name,
            onRecipes: {
              create: {
                recipe: {
                  connect: { id },
                },
                unit: n.unit,
                value: n.value,
              },
            },
          },
          update: {
            onRecipes: {
              create: {
                recipe: {
                  connect: { id },
                },
                unit: n.unit,
                value: n.value,
              },
            },
          },
        })
      }
    }
    const updatedRecipe = await this.prisma.recipe.update({
      where: { id },
      data: {
        title: content.title,
        difficulty: content.difficulty,
        instructions: content.instructions,
        serving: content.serving,
        tags: content.tags,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
        ingredientsNum: {
          include: {
            ingredient: true,
          },
        },
      },
    })
    return this._parseRecipe(updatedRecipe)
  }

  async delete(id: string, authorId: string): Promise<Recipe> {
    const { name } = await this.prisma.user.findUniqueOrThrow({
      where: { id: authorId },
    })
    const deletedRecipe = await this.prisma.recipe.delete({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
          },
        },
        ingredientsNum: {
          include: {
            ingredient: true,
          },
        },
      },
    })
    return this._parseRecipe(deletedRecipe)
  }

  _uploadImagesToS3(instructions: RecipeStepInput[]){
    let imagesUrls: RecipeStep[]
    for (let i of instructions) {
      const {filename, mimetype, encoding, createReadStream} = await i.image
      const stream = createReadStream()
      const buffer = await stream2buffer(stream)
      this.s3Service.uploadImage(filename, buffer)
    }
  }

  _parseRecipe(
    recipeFromPrisma: RecipeDetailsPrisma,
    userLike: boolean = false,
    userBasket: boolean = false,
  ): Recipe {
    return {
      id: recipeFromPrisma.id,
      title: recipeFromPrisma.title,
      authorId: recipeFromPrisma.authorId,
      authorName: recipeFromPrisma.author.name,
      difficulty: recipeFromPrisma.difficulty,
      // difficulty: recipeFromPrisma.difficulty != null ? recipeFromPrisma.difficulty : undefined,
      ingredientsNum: recipeFromPrisma.ingredientsNum.map(e => ({
        ingredientId: e.ingredientId,
        recipeId: e.recipeId,
        name: e.ingredient.name,
        unit: e.unit,
        value: e.value,
      })),
      instructions: recipeFromPrisma.instructions,
      basketedByCurrentUser: userBasket,
      basketsNum: recipeFromPrisma.basketsNum,
      likedByCurrentUser: userLike,
      likesNum: recipeFromPrisma.likesNum,
      serving: recipeFromPrisma.serving ?? 0,
      tags: recipeFromPrisma.tags,
      createdAt: recipeFromPrisma.createdAt
        ? recipeFromPrisma.createdAt
        : recipeFromPrisma.createdAt,
      updatedAt: recipeFromPrisma.updatedAt ?? undefined,
    }
  }

  _parseSummary(
    recipeFromPrisma: RecipeDetailsPrisma,
    userLike: boolean = false,
    userBasket: boolean = false,
  ): RecipeSummary {
    return {
      id: recipeFromPrisma.id,
      authorId: recipeFromPrisma.authorId,
      authorName: recipeFromPrisma.author.name,
      title: recipeFromPrisma.title,
      difficulty: recipeFromPrisma.difficulty,
      basketsNum: recipeFromPrisma.basketsNum,
      basketedByCurrentUser: userBasket,
      likedByCurrentUser: userLike,
      likesNum: recipeFromPrisma.likesNum,
      createdAt: recipeFromPrisma.createdAt
        ? recipeFromPrisma.createdAt
        : recipeFromPrisma.createdAt,
      updatedAt: recipeFromPrisma.updatedAt ?? undefined,
    }
  }
}
