import { Test, TestingModule } from '@nestjs/testing'
import { PrismaModule } from 'src/prisma/prisma.module'
import { PrismaService } from 'src/prisma/prisma.service'
import { RecipeResolvers } from './recipe.resolvers'
import { RecipeService } from './recipe.service'
import { testHelper } from '../../test/test-helpers'
import { INestApplication } from '@nestjs/common'

describe('RecipeService', () => {
  let app: INestApplication
  let service: RecipeService
  let prisma: PrismaService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecipeResolvers, RecipeService],
      imports: [PrismaModule],
    }).compile()

    service = module.get<RecipeService>(RecipeService)
    prisma = app.get<PrismaService>(PrismaService)
    await testHelper.createUsers(prisma)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // it('should create a recipe and retrun it', async () => {
  //   expect(
  //     await service.create({
  //       title: 'test',
  //       authorId: 'testuser0',
  //       difficulty: undefined,
  //       ingredientsNum: [
  //         {
  //           recipeId: '1',
  //           name: 'ingred1',
  //           unit: 'g',
  //           value: '100',
  //         },
  //       ],
  //       instructions: [''],
  //       serving: 1,
  //     }),
  //   ).toMatchInlineSnapshot()
  // })

  it('upload images while creating a new recipe')
})
