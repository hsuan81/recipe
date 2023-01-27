import { Test, TestingModule } from '@nestjs/testing'
import { PrismaModule } from 'src/prisma/prisma.module'
import { PrismaService } from 'src/prisma/prisma.service'
import { RecipeResolvers } from './recipe.resolvers'
import { RecipeService } from './recipe.service'
import { testHelper } from '../../test/test-helpers'
import { INestApplication } from '@nestjs/common'
import { S3Service } from 'src/s3/s3.service'

describe('RecipeService', () => {
  let app: INestApplication
  let service: RecipeService
  let prisma: PrismaService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecipeResolvers, RecipeService, S3Service],
      imports: [PrismaModule],
    }).compile()

    // service = await module.resolve(RecipeService)

    // app = module.createNestApplication()
    // await app.init()
    service = module.get<RecipeService>(RecipeService)
    prisma = module.get<PrismaService>(PrismaService)
    // await testHelper.createUsers(prisma)
  })

  // afterEach(async () => {
  //   await prisma.$queryRaw`TRUNCATE "Favorite" CASCADE;`
  // })

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

  // it('get recipe by ID', async () => {
  //   const recipe1 = await service.getById('testrecipe0')
  //   expect({
  //     authorId: recipe1.authorId,
  //     authorName: recipe1.authorName,
  //     basketedByCurrentUser: recipe1.basketedByCurrentUser,
  //     basketsNum: recipe1.basketsNum,
  //     coverImageUrl: recipe1.coverImageUrl,
  //     difficulty: recipe1.difficulty,
  //     likedByCurrentUser: recipe1.likedByCurrentUser,
  //     likesNum: recipe1.likesNum,
  //   }).toMatchInlineSnapshot(`
  //     Object {
  //       "authorId": "testuser0",
  //       "authorName": "testuser0",
  //       "basketedByCurrentUser": false,
  //       "basketsNum": 0,
  //       "coverImageUrl": undefined,
  //       "difficulty": "MODERATE3",
  //       "likedByCurrentUser": false,
  //       "likesNum": 0,
  //     }
  //   `)
  // })

  // it('get recipe by ID if the recipe is liked by current user', async () => {
  //   const liked = await service.favorite('testuser0', 'testrecipe1')
  //   const recipe1 = await service.getById('testrecipe1', 'testuser0')
  //   expect({
  //     authorId: recipe1.authorId,
  //     authorName: recipe1.authorName,
  //     basketedByCurrentUser: recipe1.basketedByCurrentUser,
  //     basketsNum: recipe1.basketsNum,
  //     coverImageUrl: recipe1.coverImageUrl,
  //     difficulty: recipe1.difficulty,
  //     likedByCurrentUser: recipe1.likedByCurrentUser,
  //     likesNum: recipe1.likesNum,
  //   }).toMatchInlineSnapshot(`
  //     Object {
  //       "authorId": "testuser1",
  //       "authorName": "testuser1",
  //       "basketedByCurrentUser": false,
  //       "basketsNum": 0,
  //       "coverImageUrl": undefined,
  //       "difficulty": "EASY1",
  //       "likedByCurrentUser": true,
  //       "likesNum": 1,
  //     }
  //   `)
  // })

  // it('like a recipe and unlike a recipe', async () => {
  //   const likeNumBefore = await service.getLikesNum('testrecipe0')
  //   expect(likeNumBefore).toMatchInlineSnapshot(`0`)
  //   const result = await service.favorite('testuser0', 'testrecipe0')
  //   expect(result).toMatchInlineSnapshot(`1`)
  //   const result2 = await service.unFavorite('testuser0', 'testrecipe0')
  //   expect(result2).toMatchInlineSnapshot(`0`)
  //   // expect(result).toEqual(expected)
  // })

  // it('get recipe by tag', async () => {
  //   const result = await service.getByTags(['aa'])
  //   expect(
  //     result.map(e => ({
  //       id: e.id,
  //       tags: e.tags,
  //       basketedByCurrentUser: e.basketedByCurrentUser,
  //       likedByCurrentUser: e.likedByCurrentUser,
  //     })),
  //   ).toMatchInlineSnapshot(`
  //     Array [
  //       Object {
  //         "basketedByCurrentUser": false,
  //         "id": "testrecipe1",
  //         "likedByCurrentUser": false,
  //         "tags": Array [
  //           "aa",
  //         ],
  //       },
  //       Object {
  //         "basketedByCurrentUser": false,
  //         "id": "testrecipe0",
  //         "likedByCurrentUser": false,
  //         "tags": Array [
  //           "aa",
  //           "bb",
  //         ],
  //       },
  //     ]
  //   `)
  // })

  // it('get recipe by tag if the recipe is liked by current user', async () => {
  //   await service.favorite('testuser0', 'testrecipe1')
  //   const result = await service.getByTags(['aa'], undefined, 'testuser0')
  //   expect(
  //     result.map(e => ({
  //       id: e.id,
  //       tags: e.tags,
  //       basketsNum: e.basketsNum,
  //       basketedByCurrentUser: e.basketedByCurrentUser,
  //       likesNum: e.likesNum,
  //       likedByCurrentUser: e.likedByCurrentUser,
  //     })),
  //   ).toMatchInlineSnapshot(`
  //     Array [
  //       Object {
  //         "basketedByCurrentUser": false,
  //         "basketsNum": 0,
  //         "id": "testrecipe1",
  //         "likedByCurrentUser": true,
  //         "likesNum": 1,
  //         "tags": Array [
  //           "aa",
  //         ],
  //       },
  //       Object {
  //         "basketedByCurrentUser": true,
  //         "basketsNum": 0,
  //         "id": "testrecipe0",
  //         "likedByCurrentUser": false,
  //         "likesNum": 0,
  //         "tags": Array [
  //           "aa",
  //           "bb",
  //         ],
  //       },
  //     ]
  //   `)
  // })

  // it('get recipe by difficulty', async () => {
  //   const result = await service.getByDifficulty('MODERATE3')
  //   expect(
  //     result.map(e => ({
  //       id: e.id,
  //       difficulty: e.difficulty,
  //       basketsNum: e.basketsNum,
  //       basketedByCurrentUser: e.basketedByCurrentUser,
  //       likesNum: e.likesNum,
  //       likedByCurrentUser: e.likedByCurrentUser,
  //     })),
  //   ).toMatchInlineSnapshot(`
  //     Array [
  //       Object {
  //         "basketedByCurrentUser": false,
  //         "basketsNum": 0,
  //         "difficulty": "MODERATE3",
  //         "id": "testrecipe0",
  //         "likedByCurrentUser": false,
  //         "likesNum": 0,
  //       },
  //     ]
  //   `)
  // })

  // it('get latest recipe with afterId', async () => {
  //   const result = await service.getLatest('testrecipe1')
  //   expect(
  //     result.map(e => ({
  //       id: e.id,
  //       difficulty: e.difficulty,
  //       basketsNum: e.basketsNum,
  //       basketedByCurrentUser: e.basketedByCurrentUser,
  //       likesNum: e.likesNum,
  //       likedByCurrentUser: e.likedByCurrentUser,
  //     })),
  //   ).toMatchInlineSnapshot(`Array []`)
  // })

  // it('get number of baskets for the recipe', async () => {
  //   const result = await service.getBasketsNum('testrecipe1')
  //   expect(result).toMatchInlineSnapshot(`1`)
  // })

  it('create a recipe', () => {
    const input = {
      id: 'testrecipe00',
      authorId: 'testuser1',
      title: 'testrecipe 1',
      difficulty: 'EASY1',
      ingredientsNum: [
        {
          ingredientId: 'testingredient0',
          recipeId: 'testrecipe00',
          name: 'test ing0',
          unit: 'g',
          value: '80',
        },
        {
          ingredientId: 'testingredient0',
          recipeId: 'testrecipe00',
        },
      ],
      instructions: [],
      basketsNum: 0,
      likesNum: 0,
      serving: 0,
      tags: ['aa'],
    }
  })
  it('update a recipe', () => {})
  it('delete a recipe', () => {})
})
