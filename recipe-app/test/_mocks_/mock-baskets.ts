import { Basket } from '@prisma/client'

export const mockBaskets: Basket[] = [
  {
    id: 'testbasket0',
    userId: 'testuser0',
    recipes: ['testrecipe0'],
  },
]
// export const mockRecipesInBaskets = [
//   {
//     id: 'testbasket0',
//     recipes: [{ id: 'testrecipe0' }],
//   },
// ]
