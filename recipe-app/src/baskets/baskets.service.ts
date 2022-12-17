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

export type PrismaBasketWithIngredients = PrismaBasket & {
  recipes: (PrismaRecipe & {
    ingredientsNum: (PrismaNumIngredientOnRecipe & {
      ingredient: PrismaIngredient
    })[]
  })[]
}

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
    })
    if (!basket) {
      const createdBasket = await this.prisma.basket.create({
        data: {
          userId,
          recipes: {
            connect: { id: recipeId },
          },
        },
        include: {
          recipes: {
            include: {
              // author: {
              //   select: {
              //     name: true,
              //   },
              // },
              ingredientsNum: {
                include: { ingredient: true },
              },
            },
          },
        },
      })
      await this.prisma.recipe.update({
        where: { id: recipeId },
        data: { basketsNum: ++recipe.basketsNum },
      })
      return this._parse(createdBasket)
    } else {
      const updatedBasket = await this.prisma.basket.update({
        where: { userId },
        data: { recipes: { connect: { id: recipeId } } },
        include: {
          recipes: {
            include: {
              // author: {
              //   select: {
              //     name: true,
              //   },
              // },
              ingredientsNum: {
                include: { ingredient: true },
              },
            },
          },
        },
      })
      await this.prisma.recipe.update({
        where: { id: recipeId },
        data: { basketsNum: ++recipe.basketsNum },
      })
      return this._parse(updatedBasket)
    }
  }

  async remove(userId: string, recipeId: string): Promise<Basket> {
    const removedBasket = await this.prisma.basket.update({
      where: { userId },
      data: {
        recipes: {
          disconnect: { id: recipeId },
        },
      },
      include: {
        recipes: {
          include: {
            // author: {
            //   select: {
            //     name: true,
            //   },
            // },
            ingredientsNum: {
              include: { ingredient: true },
            },
          },
        },
      },
    })
    const recipe = await this.prisma.recipe.findUniqueOrThrow({
      where: { id: recipeId },
    })
    await this.prisma.recipe.update({
      where: { id: recipeId },
      data: { basketsNum: --recipe.basketsNum },
    })
    return this._parse(removedBasket)
  }

  async find(userId: string): Promise<Basket> {
    const basket = await this.prisma.basket.findUnique({
      where: { userId },
      include: {
        recipes: {
          include: {
            // author: {
            //   select: {
            //     name: true,
            //   },
            // },
            ingredientsNum: {
              include: { ingredient: true },
            },
          },
        },
      },
    })
    if (!basket) {
      const created = await this.prisma.basket.create({
        data: {
          userId,
        },
        include: {
          recipes: {
            include: {
              // author: {
              //   select: {
              //     name: true,
              //   },
              // },
              ingredientsNum: {
                include: { ingredient: true },
              },
            },
          },
        },
      })
      return this._parse(created)
    }
    return this._parse(basket)
  }

  private _parse(prismaBasket: PrismaBasketWithIngredients): Basket {
    return {
      id: prismaBasket.id,
      userId: prismaBasket.userId,
      // recipes: prismaBasket.recipes.map(e =>
      //   this.recipeService._parseSummary(e),
      // ),
      ingredientsNum: this._extractIngredients(prismaBasket.recipes),
    }
  }
  private _extractIngredients(
    fromRecipes: (PrismaRecipe & {
      ingredientsNum: (PrismaNumIngredientOnRecipe & {
        ingredient: PrismaIngredient
      })[]
    })[],
  ): IngredientNum[] {
    const numIngredients = []
    for (let i of fromRecipes) {
      const extracted = i.ingredientsNum.map(e => ({
        ingredientId: e.ingredientId,
        recipeId: e.recipeId,
        name: e.ingredient.name,
        unit: e.unit,
        value: e.value,
      }))
      numIngredients.push(...extracted)
    }
    return numIngredients
  }
}
