import { Recipe } from '@prisma/client'

export const mockRecipes: Recipe[] = [
  {
    id: 'testrecipe0',
    authorId: 'testuser0',
    title: 'testrecipe 0',
    difficulty: 'MODERATE3',
    instructions: ['test instruct'],
    createdAt: new Date(),
    updatedAt: new Date(),
    likesNum: 0,
    serving: 0,
    tags: ['aa', 'bb'],
    viewrs: 0,
  },
  {
    id: 'testrecipe1',
    authorId: 'testuser1',
    title: 'testrecipe 1',
    difficulty: 'NOSCALE',
    instructions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    likesNum: 0,
    serving: 0,
    tags: ['aa'],
    viewrs: 0,
  },
]
