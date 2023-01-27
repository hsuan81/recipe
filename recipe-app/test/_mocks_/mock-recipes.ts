import { Recipe } from '@prisma/client'

export const mockRecipes: Recipe[] = [
  {
    id: 'testrecipe0',
    authorId: 'testuser0',
    title: 'testrecipe 0',
    difficulty: 'MODERATE3',
    // instructions: ['test instruct'],
    createdAt: new Date(),
    updatedAt: new Date(),
    basketsNum: 0,
    likesNum: 0,
    serving: 0,
    tags: ['aa', 'bb'],
  },
  {
    id: 'testrecipe1',
    authorId: 'testuser1',
    title: 'testrecipe 1',
    difficulty: 'EASY1',
    // instructions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    basketsNum: 1,
    likesNum: 0,
    serving: 0,
    tags: ['aa'],
    // viewrs: 0,
  },
]
