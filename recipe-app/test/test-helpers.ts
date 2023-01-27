import { PrismaService } from '../src/prisma/prisma.service'
import { mockBotUser, mockUsers } from './_mocks_/mock-user'
import { mockIngreds } from './_mocks_/mock-ingredients'
import { mockRecipes } from './_mocks_/mock-recipes'
import { mockNumIngreds } from './_mocks_/mock-numIngredients'
import { mockBaskets } from './_mocks_/mock-baskets'

class TestHelper {
  async createUsers(prisma: PrismaService) {
    await prisma.user.create({ data: mockBotUser })
    return await prisma.$transaction(
      mockUsers.map(e => prisma.user.create({ data: e })),
    )
  }

  async createIngredients(prisma: PrismaService) {
    return await prisma.$transaction(
      mockIngreds.map(e => prisma.ingredient.create({ data: e })),
    )
  }

  async createRecipes(prisma: PrismaService) {
    return await prisma.$transaction(
      mockRecipes.map(e => prisma.recipe.create({ data: e })),
    )
  }

  async createNumIngrediens(prisma: PrismaService) {
    return await prisma.$transaction(
      mockNumIngreds.map(e => prisma.numIngredientOnRecipe.create({ data: e })),
    )
  }

  async createBaskets(prisma: PrismaService) {
    return await prisma.$transaction(
      mockBaskets.map(e => prisma.basket.create({ data: e })),
    )
    // return await prisma.$transaction(
    //   mockRecipesInBaskets.map(e =>
    //     prisma.basket.update({
    //       where: { id: e.id },
    //       data: {
    //         recipes: { connect: e.recipes },
    //       },
    //     }),
    //   ),
    // )
  }
}
export const testHelper = new TestHelper()
