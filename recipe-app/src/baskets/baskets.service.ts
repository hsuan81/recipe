import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import {
  Basket as PrismaBasket,
  Recipe as PrismaRecipe,
  Ingredient as PrismaIngredient,
  NumIngredientOnRecipe as PrismaNumIngredientOnRecipe,
} from '@prisma/client'
import { Basket } from './model/basket.model'
import { IngredientNum } from 'src/recipe/models/recipe.model'
import { RecipeDetailsPrisma, RecipeService } from 'src/recipe/recipe.service'

// export type PrismaBasketWithIngredients = PrismaBasket & {
//   recipes: (PrismaRecipe & {
//     ingredientsNum: (PrismaNumIngredientOnRecipe & {
//       ingredient: PrismaIngredient
//     })[]
//   })[]
// }

export type PrismaIngredientsNum = (PrismaNumIngredientOnRecipe & {
  ingredient: PrismaIngredient
})[]

// export type PrismaBasketWithIngredients = PrismaBasket & {
//   recipes: RecipeDetailsPrisma[]
// }

@Injectable()
export class BasketsService {
  constructor(
    private prisma: PrismaService, // private recipeService: RecipeService,
  ) {}

  /**
   * Add recipe to user's basket if any or create a basket first and add the recipe.
   * And increment the number of baskets containing this recipe on the Recipe object.
   * Return updated basket.
   *
   * @param userId - the user's id
   * @param recipeId - the recipe id
   * @returns The updated basket.
   */
  async add(userId: string, recipeId: string): Promise<Basket> {
    const basket = await this.prisma.basket.findUnique({ where: { userId } })
    const recipe = await this.prisma.recipe.findUniqueOrThrow({
      where: { id: recipeId },
      include: {
        ingredientsNum: {
          include: { ingredient: true },
        },
      },
    })
    if (!basket) {
      const createdBasket = await this.prisma.basket.create(
        {
          data: {
            userId,
            recipes: [recipeId],
          },
        },
        // include: {
        //   recipes: {
        //     include: {
        //       // author: {
        //       //   select: {
        //       //     name: true,
        //       //   },
        //       // },
        //       ingredientsNum: {
        //         include: { ingredient: true },
        //       },
        //     },
        //   },
        // },
      )
      await this.prisma.recipe.update({
        where: { id: recipeId },
        data: { basketsNum: ++recipe.basketsNum },
      })
      return this._parse(createdBasket, recipe.ingredientsNum)
    } else {
      const updatedBasket = await this.prisma.basket.update(
        {
          where: { userId },
          data: { recipes: { push: recipeId } },
        },
        // include: {
        //   recipes: {
        //     include: {
        //       // author: {
        //       //   select: {
        //       //     name: true,
        //       //   },
        //       // },
        //       ingredientsNum: {
        //         include: { ingredient: true },
        //       },
        //     },
        //   },
        // },
      )
      await this.prisma.recipe.update({
        where: { id: recipeId },
        data: { basketsNum: ++recipe.basketsNum },
      })
      return this._parse(updatedBasket, recipe.ingredientsNum)
    }
  }

  async remove(userId: string, recipeId: string): Promise<Basket> {
    const { recipes } = await this.prisma.basket.findUniqueOrThrow({
      where: { userId },
    })
    const removedRecipeIds = recipes.filter(e => e != recipeId)
    const removedBasket = await this.prisma.basket.update({
      where: { userId },
      data: {
        recipes: removedRecipeIds,
        // disconnect: { id: recipeId },
      },
      // include: {
      //   recipes: {
      //     include: {
      //       // author: {
      //       //   select: {
      //       //     name: true,
      //       //   },
      //       // },
      //       ingredientsNum: {
      //         include: { ingredient: true },
      //       },
      //     },
      //   },
      // },
    })
    const recipe = await this.prisma.recipe.findUniqueOrThrow({
      where: { id: recipeId },
    })
    const updatedRecipe = await this.prisma.recipe.update({
      where: { id: recipeId },
      data: { basketsNum: --recipe.basketsNum },
      include: {
        ingredientsNum: {
          include: { ingredient: true },
        },
      },
    })
    return this._parse(removedBasket, updatedRecipe.ingredientsNum)
  }

  async find(userId: string): Promise<Basket> {
    const basket = await this.prisma.basket.findUnique({
      where: { userId },
      // include: {
      //   recipes: {
      //     include: {
      //       // author: {
      //       //   select: {
      //       //     name: true,
      //       //   },
      //       // },
      //       ingredientsNum: {
      //         include: { ingredient: true },
      //       },
      //     },
      //   },
      // },
    })
    if (!basket) {
      const created = await this.prisma.basket.create({
        data: {
          userId,
          recipes: [],
        },
        // include: {
        //   recipes: {
        //     include: {
        //       // author: {
        //       //   select: {
        //       //     name: true,
        //       //   },
        //       // },
        //       ingredientsNum: {
        //         include: { ingredient: true },
        //       },
        //     },
        //   },
        // },
      })
      return this._parse(created, [])
    }
    const ingredientsNum = await this.prisma.numIngredientOnRecipe.findMany({
      where: { recipeId: { in: basket.recipes } },
      include: { ingredient: true },
    })
    return this._parse(basket, ingredientsNum)
  }

  private _parse(
    prismaBasket: PrismaBasket,
    ingredientsNum: PrismaIngredientsNum,
  ): Basket {
    return {
      id: prismaBasket.id,
      userId: prismaBasket.userId,
      // recipes: prismaBasket.recipes.map(e =>
      //   this.recipeService._parseSummary(e),
      // ),
      ingredientsNum: this._extractIngredients(ingredientsNum),
    }
  }

  private _extractIngredients(
    fromPrismaIngredientsNum: PrismaIngredientsNum,
  ): IngredientNum[] {
    const numIngredients = []
    for (let i of fromPrismaIngredientsNum) {
      const extracted = {
        ingredientId: i.ingredientId,
        recipeId: i.recipeId,
        name: i.ingredient.name,
        unit: i.unit ?? undefined,
        value: i.value ?? undefined,
      }
      // const extracted = i.map(e => ({
      //   ingredientId: e.ingredientId,
      //   recipeId: e.recipeId,
      //   name: e.ingredient.name,
      //   unit: e.unit,
      //   value: e.value,
      // }))
      numIngredients.push(extracted)
    }
    return numIngredients
  }

  // private _extractIngredients(
  //   fromRecipes: (PrismaRecipe & {
  //     ingredientsNum: (PrismaNumIngredientOnRecipe & {
  //       ingredient: PrismaIngredient
  //     })[]
  //   })[],
  // ): IngredientNum[] {
  //   const numIngredients = []
  //   for (let i of fromRecipes) {
  //     const extracted = i.ingredientsNum.map(e => ({
  //       ingredientId: e.ingredientId,
  //       recipeId: e.recipeId,
  //       name: e.ingredient.name,
  //       unit: e.unit,
  //       value: e.value,
  //     }))
  //     numIngredients.push(...extracted)
  //   }
  //   return numIngredients
  // }
}
