import { testHelper } from '../../../test/test-helpers'
import { PrismaService } from '../prisma.service'

const prisma = new PrismaService({ errorFormat: 'pretty' })

async function main() {
  console.log('Truncating databse...')
  await prisma.$queryRaw`TRUNCATE "User", "Recipe", "Basket", "Ingredient", "NumIngredientOnRecipe", "Favorite" CASCADE;`

  await testHelper.createUsers(prisma)
  await testHelper.createIngredients(prisma)
  await testHelper.createRecipes(prisma)
  await testHelper.createNumIngrediens(prisma)
  await testHelper.createBaskets(prisma)
}

main()
  .catch(err => {
    console.error('error', err)
    throw new Error()
  })
  .finally(async () => {
    console.log('Done, closing primsa')
    // scraper.dump()
    prisma.$disconnect()
    process.exit()
  })
