import { Injectable } from '@nestjs/common'
import {
  Ingredient as PrismaIngredient,
  NumIngredientOnRecipe as PrismaNumIngredientOnRecipe,
  Recipe as PrismaRecipe,
  RecipeStep as PrismaRecipeStep,
} from '@prisma/client'
import e from 'express'
import { truncate } from 'fs'
import { imageUrl, S3Service } from 'src/s3/s3.service'
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

    // Check the user exists
    const author = await this.prisma.user.findUniqueOrThrow({
      where: { name: content.authorName },
    })

    // Create recipe
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

    // Create instructions and upload images to s3
    const recipeSteps = await this._createInstructions(
      createdRecipe.id,
      content.instructions,
    )

    return this._parseRecipe(createdRecipe, recipeSteps)
  }

  async getById(id: string, currentUserId?: string): Promise<RecipeSummary> {
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
    const coverImage = await this.prisma.recipeStep.findFirst({
      where: {
        recipeId: recipe.id,
        stepNum: 0,
      },
    })

    if (currentUserId != undefined) {
      const likedByUser = await this._likedByCurrentUser(id, currentUserId)
      const basketByUser = await this._basketedByCurrentUser(id, currentUserId)
      return this._parseSummary(
        recipe,
        typeof coverImage?.imageUrl === 'string'
          ? coverImage.imageUrl
          : undefined,
        likedByUser,
        basketByUser,
      )
    }

    return this._parseSummary(
      recipe,
      typeof coverImage?.imageUrl === 'string'
        ? coverImage.imageUrl
        : undefined,
    )
  }

  // Like a recipe and return the updated number of likes on this recipe
  async favorite(userId: string, recipeId: string): Promise<Number> {
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
      // return this._parseRecipe(updatedRecipe, true, undefined)
    }

    // return this._parseRecipe(recipe)
    return recipe.likesNum
  }

  async unFavorite(userId: string, recipeId: string): Promise<Number> {
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
      // return this._parseRecipe(updatedRecipe, false, undefined)
    }

    // return this._parseRecipe(recipe)
    return recipe.likesNum
  }

  async getByTags(
    tags: string[],
    afterId?: string,
    currentUserId?: string,
  ): Promise<RecipeSummary[]> {
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
    // const recipes = recipesfromDB.map(e => {
    //   return this._parseSummary(e)
    // })
    const recipes = await this._formRecipeSummaries(
      recipesfromDB,
      currentUserId,
    )
    return recipes
  }

  // async getByTagsAuthenticated(tags: string[], afterId?: string, user)

  async getByDifficulty(
    difficulty: Difficulty,
    afterId?: string,
    currentUserId?: string,
  ): Promise<RecipeSummary[]> {
    const recipesfromDB = await this.prisma.recipe.findMany({
      where: {
        difficulty: difficulty,
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
    // const recipes = recipesfromDB.map(e => {
    //   return this._parseSummary(e)
    // })
    const recipes = await this._formRecipeSummaries(
      recipesfromDB,
      currentUserId,
    )
    return recipes
  }

  async getLatest(
    afterId?: string,
    currentUserId?: string,
  ): Promise<RecipeSummary[]> {
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

    // const coverImage = await this.prisma.recipeStep.findFirst({
    //   where: {
    //     recipeId: recipe.id,
    //     stepNum: 0,
    //   },
    // })

    // const recipes = recipesfromDB.map(e => {
    //   return this._parseSummary(e)
    // })
    const recipes = await this._formRecipeSummaries(
      recipesfromDB,
      currentUserId,
    )
    return recipes
  }

  async getLikesNum(recipeId: string): Promise<Number> {
    const { likesNum } = await this.prisma.recipe.findUniqueOrThrow({
      where: { id: recipeId },
      select: { likesNum: true },
    })
    return likesNum
  }

  async getBasketsNum(recipeId: string): Promise<Number> {
    const { basketsNum } = await this.prisma.recipe.findUniqueOrThrow({
      where: { id: recipeId },
      select: { basketsNum: true },
    })
    return basketsNum
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
        // instructions: content.instructions,
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
    const updatedRecipeSteps = await this._updateRecipeInstructions(
      id,
      content.instructions,
    )
    return this._parseRecipe(updatedRecipe, updatedRecipeSteps)
  }

  async delete(id: string, authorId: string): Promise<RecipeSummary> {
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
    return this._parseSummary(deletedRecipe)
  }

  async _createInstructions(
    recipeId: string,
    instructions: RecipeStepInput[],
  ): Promise<PrismaRecipeStep[]> {
    let recipeSteps: PrismaRecipeStep[] = []
    for (let i of instructions) {
      // if (i.image != null) {
      //   const { filename, mimetype, encoding, createReadStream } = await i.image
      //   const stream = createReadStream()
      //   const buffer = await stream2buffer(stream)
      //   const url = await this.s3Service.uploadImage(filename, buffer)
      // }
      // const step = await this.prisma.recipeStep.create({
      //   data: {
      //     ...i,
      //     imageName: url.filename,
      //     imageUrl: url.url,
      //     recipe: {
      //       connect: {
      //         id: recipeId,
      //       },
      //     },
      //   },
      // })
      const step = await this._createOneInstruction(recipeId, i)
      recipeSteps.push({ ...step })
    }
    return recipeSteps
  }

  async _createOneInstruction(
    recipeId: string,
    instruction: RecipeStepInput,
  ): Promise<PrismaRecipeStep> {
    let getUrl
    if (instruction.image != null) {
      const { filename, mimetype, encoding, createReadStream } =
        await instruction.image
      const stream = createReadStream()
      const buffer = await stream2buffer(stream)
      const url = await this.s3Service.uploadImage(filename, buffer)
      getUrl = function () {
        return url
      }
    }
    const step = await this.prisma.recipeStep.create({
      data: {
        ...instruction,
        imageName: getUrl?.().filename,
        imageUrl: getUrl?.().url,
        recipe: {
          connect: {
            id: recipeId,
          },
        },
      },
    })
    return step
  }

  async _deleteOneInstruction(recipeStepId: string) {
    await this.prisma.recipeStep.delete({
      where: {
        id: recipeStepId,
      },
    })
  }

  async _updateOneInstruction(
    recipeId: string,
    step: RecipeStepInput,
  ): Promise<PrismaRecipeStep> {
    // Get the instruction stored in the db
    const storedStep = await this.prisma.recipeStep.findFirstOrThrow({
      where: { recipeId, stepNum: step.stepNum },
    })
    // Preprocess the uploaded image
    // If image is not empty, upload it to s3
    let getUrl
    if (step.image != null) {
      const { filename, mimetype, encoding, createReadStream } =
        await step.image!
      const stream = createReadStream()
      const buffer = await stream2buffer(stream)
      const url = await this.s3Service.uploadImage(filename, buffer)
      getUrl = function () {
        return url
      }
      if (storedStep.imageUrl != null) {
        await this.s3Service.deleteImage(storedStep.imageName!)
      }
    }

    // Compare the new input instruction with the one stored in the db
    // If instruction string is different
    // if (storedStep.instruction !== step.instruction) {
    // }

    const updatedStep = await this.prisma.recipeStep.update({
      where: { id: storedStep.id },
      data: {
        instruction:
          storedStep.instruction !== step.instruction
            ? step.instruction
            : undefined,
        imageName: getUrl?.().filename,
        imageUrl: getUrl?.().url,
      },
    })
    return updatedStep
  }

  async _updateRecipeInstructions(
    recipeId: string,
    instructions: RecipeStepInput[],
  ): Promise<PrismaRecipeStep[]> {
    const stepsFromPrisma = await this.prisma.recipeStep.findMany({
      where: {
        recipeId,
      },
      orderBy: {
        stepNum: 'asc',
      },
    })

    instructions.sort((a, b) => a.stepNum - b.stepNum)

    let updatedSteps: PrismaRecipeStep[] = []

    for (let r in instructions) {
      if (instructions[r].stepNum == stepsFromPrisma[r].stepNum)
        updatedSteps.push(
          await this._updateOneInstruction(recipeId, instructions[r]),
        )

      if (instructions[r].stepNum < stepsFromPrisma[r].stepNum)
        updatedSteps.push(
          await this._createOneInstruction(recipeId, instructions[r]),
        )
      else await this._deleteOneInstruction(stepsFromPrisma[r].id)
    }
    return updatedSteps
  }

  async _likedByCurrentUser(
    recipeId: string,
    userId: string,
  ): Promise<boolean> {
    const recipes = await this.prisma.favorite.findUnique({
      where: { userId },
      select: { recipes: true },
    })
    const recipeIds = recipes?.recipes.map(e => e.id)
    return !!recipeIds?.some(e => e === recipeId)
  }

  async _basketedByCurrentUser(
    recipeId: string,
    userId: string,
  ): Promise<boolean> {
    const recipes = await this.prisma.basket.findUnique({
      where: { userId },
      select: { recipes: true },
    })
    const recipeIds = recipes?.recipes.map(e => e.id)
    return !!recipeIds?.some(e => e === recipeId)
  }

  async _formRecipeSummaries(
    recipes: RecipeDetailsPrisma[],
    currentUserId?: string,
  ) {
    let recipeSummaries: RecipeSummary[] = []
    for (let i in recipes) {
      const coverImage = await this.prisma.recipeStep.findFirst({
        where: {
          recipeId: recipes[i].id,
          stepNum: 0,
        },
      })

      if (currentUserId != undefined) {
        const likedByUser = await this._likedByCurrentUser(
          recipes[i].id,
          currentUserId,
        )
        const basketByUser = await this._basketedByCurrentUser(
          recipes[i].id,
          currentUserId,
        )
        recipeSummaries.push(
          this._parseSummary(
            recipes[i],
            typeof coverImage?.imageUrl === 'string'
              ? coverImage.imageUrl
              : undefined,
            likedByUser,
            basketByUser,
          ),
        )
      } else
        recipeSummaries.push(
          this._parseSummary(
            recipes[i],
            typeof coverImage?.imageUrl === 'string'
              ? coverImage.imageUrl
              : undefined,
          ),
        )
    }
    return recipeSummaries
  }

  _parseRecipe(
    recipeFromPrisma: RecipeDetailsPrisma,
    recipeStepsFromPrisma: PrismaRecipeStep[],
    likedByCurrentUser: boolean = false,
    basketedByCurrentUser: boolean = false,
  ): Recipe {
    return {
      id: recipeFromPrisma.id,
      title: recipeFromPrisma.title,
      authorId: recipeFromPrisma.authorId,
      authorName: recipeFromPrisma.author.name,
      difficulty: recipeFromPrisma.difficulty,
      // difficulty: recipeFromPrisma.difficulty != null ? recipeFromPrisma.difficulty : undefined,
      ingredientsNum: recipeFromPrisma.ingredientsNum.map(e => ({
        ...e,
        // ingredientId: e.ingredientId,
        // recipeId: e.recipeId,
        name: e.ingredient.name,
        // unit: e.unit,
        // value: e.value,
      })),
      instructions: recipeStepsFromPrisma.map(e => ({
        ...e,
        instruction: e.instruction ?? undefined,
        imageName: e.imageName ?? undefined,
        imageUrl: e.imageUrl ?? undefined,
      })),
      basketedByCurrentUser: basketedByCurrentUser,
      basketsNum: recipeFromPrisma.basketsNum,
      likedByCurrentUser: likedByCurrentUser,
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
    coverImageUrl?: string,
    likedByCurrentUser: boolean = false,
    basketedByCurrentUser: boolean = false,
  ): RecipeSummary {
    return {
      id: recipeFromPrisma.id,
      authorId: recipeFromPrisma.authorId,
      authorName: recipeFromPrisma.author.name,
      coverImageUrl: coverImageUrl ?? undefined,
      title: recipeFromPrisma.title,
      difficulty: recipeFromPrisma.difficulty,
      basketsNum: recipeFromPrisma.basketsNum,
      basketedByCurrentUser: basketedByCurrentUser,
      likedByCurrentUser: likedByCurrentUser,
      likesNum: recipeFromPrisma.likesNum,
      createdAt: recipeFromPrisma.createdAt
        ? recipeFromPrisma.createdAt
        : recipeFromPrisma.createdAt,
      updatedAt: recipeFromPrisma.updatedAt ?? undefined,
    }
  }
}
