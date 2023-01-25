import { Recipe, RecipeStep } from '@prisma/client'

export const mockRecipeSteps: RecipeStep[] = [
  {
    id: 'teststep0',
    stepNum: 0,
    recipeId: 'testrecipe0',
    instruction: '',
    imageName: '',
    imageUrl: '',
  },
  {
    id: 'teststep1-0',
    stepNum: 0,
    recipeId: 'testrecipe1',
    instruction: 'cover123',
    imageName: 'cover.jpeg',
    imageUrl:
      'https://hyc-side-project.s3.ap-northeast-1.amazonaws.com/recipe/cover.jpeg',
  },
  {
    id: 'teststep1-1',
    stepNum: 1,
    recipeId: 'testrecipe1',
    instruction: 'step1',
    imageName: 'foodStep1.png',
    imageUrl:
      'https://hyc-side-project.s3.ap-northeast-1.amazonaws.com/recipe/foodStep1.png',
  },
]
