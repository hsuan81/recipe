import { registerEnumType } from '@nestjs/graphql'

export enum Difficulty {
  DIFFICULT5 = 'DIFFICULT5',
  DIFFICULT4 = 'DIFFICULT4',
  MODERATE3 = 'MODERATE3',
  EASY2 = 'EASY2',
  EASY1 = 'EASY1',
}

registerEnumType(Difficulty, {
  name: 'Difficulty',
  description: 'The recipe difficulty scale of 1 to 5.',
})
