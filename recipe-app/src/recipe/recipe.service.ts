import { Injectable } from '@nestjs/common'
import {
  Ingredient as PrismaIngredient,
  NumIngredientOnRecipe as PrismaNumIngredientOnRecipe,
  Recipe as PrismaRecipe,
} from '@prisma/client'
import { truncate } from 'fs'
// import { Recipe } from '../graphql.schema';
import { PrismaService } from '../prisma/prisma.service'
import { RecipeInput } from './dto/create-recipe.dto'
import { Difficulty } from './enum/difficulty.enum'
// import { RecipeInput, IngredientNumInput } from './dto/create-recipe.dto';
import { Recipe, IngredientNum } from './models/recipe.model'

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
}

@Injectable()
export class RecipeService {
  constructor(private prisma: PrismaService) {}

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

    const createdRecipe = await this.prisma.recipe.create({
      data: {
        ...content,
        // author: {
        //   connect: { email: '' },
        // },
        ingredientsNum: {
          createMany: {
            data: ingredientsOnRecipe,
          },
        },
      },
      include: {
        ingredientsNum: {
          include: {
            ingredient: true,
          },
        },
      },
    })
    return this._parse(createdRecipe)
  }

  async findById(id: string): Promise<Recipe> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
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
    return this._parse(recipe)
  }

  async getByTags(tags: string[], afterId?: string): Promise<Recipe[]> {
    const recipesfromDB = await this.prisma.recipe.findMany({
      where: {
        tags: {
          hasEvery: tags,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
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
      return this._parse(e)
    })
    return recipes
  }

  async getLatest(afterId?: string): Promise<Recipe[]> {
    const recipesfromDB = await this.prisma.recipe.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
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
      return this._parse(e)
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
        ingredientsNum: {
          include: {
            ingredient: true,
          },
        },
      },
    })
    return this._parse(updatedRecipe)
  }

  async delete(id: string): Promise<Recipe> {
    const deletedRecipe = await this.prisma.recipe.delete({
      where: { id },
      include: {
        ingredientsNum: {
          include: {
            ingredient: true,
          },
        },
      },
    })
    return this._parse(deletedRecipe)
  }

  _parse(recipeFromPrisma: RecipeDetailsPrisma): Recipe {
    return {
      id: recipeFromPrisma.id,
      title: recipeFromPrisma.title,
      authorId: recipeFromPrisma.authorId,
      difficulty: recipeFromPrisma.difficulty ?? undefined,
      // difficulty: recipeFromPrisma.difficulty != null ? recipeFromPrisma.difficulty : undefined,
      ingredientsNum: recipeFromPrisma.ingredientsNum.map(e => ({
        ingredientId: e.ingredientId,
        recipeId: e.recipeId,
        name: e.ingredient.name,
        unit: e.unit,
        value: e.value,
      })),
      instructions: recipeFromPrisma.instructions,
      serving: recipeFromPrisma.serving ?? 0,
      tags: recipeFromPrisma.tags,
      createdAt: recipeFromPrisma.createdAt
        ? recipeFromPrisma.createdAt
        : recipeFromPrisma.createdAt,
      updatedAt: recipeFromPrisma.updatedAt ?? undefined,
    }
  }
}
