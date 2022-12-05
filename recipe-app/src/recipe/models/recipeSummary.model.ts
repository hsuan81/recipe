import { Field, ID, Int, ObjectType } from '@nestjs/graphql'
import { Difficulty } from '../enum/difficulty.enum'
// import { IngredientNum } from 'src/graphql.schema';

// export type Difficulty = 'ACTIVE' | 'ARCHIVE' | 'DELETE' | 'DRAFT' | 'LOCK' | 'REPORTED';

@ObjectType({ description: 'summary of a recipe' })
export class RecipeSummary {
  @Field(type => ID)
  id: string

  @Field()
  authorName: string

  @Field()
  title: string

  @Field(type => Difficulty, { nullable: true })
  difficulty: Difficulty[keyof Difficulty]
  // difficulty?: 'DIFFICULT5' | 'DIFFICULT4' | 'MODERATE3' | 'EASY2' | 'EASY1'

  @Field(type => Int)
  likesNum: number

  @Field(type => Int)
  basketsNum: number

  @Field()
  createdAt: Date

  @Field({ nullable: true })
  updatedAt?: Date

  @Field(type => Boolean)
  likedByCurrentUser: boolean

  @Field(type => Boolean)
  basketedByCurrentUser: boolean
  // cover image
}