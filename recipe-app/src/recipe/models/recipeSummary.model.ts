import { Field, ID, Int, ObjectType } from '@nestjs/graphql'
import { Difficulty } from '../enum/difficulty.enum'
// import { IngredientNum } from 'src/graphql.schema';

// export type Difficulty = 'ACTIVE' | 'ARCHIVE' | 'DELETE' | 'DRAFT' | 'LOCK' | 'REPORTED';

@ObjectType({ description: 'summary of a recipe' })
export class RecipeSummary {
  @Field(type => ID)
  id: string

  @Field(type => ID)
  authorId: string

  @Field()
  authorName: string

  @Field({ nullable: true })
  coverImageUrl?: string

  @Field()
  title: string

  @Field(type => Difficulty, { nullable: true })
  difficulty: Difficulty[keyof Difficulty]
  // difficulty?: 'DIFFICULT5' | 'DIFFICULT4' | 'MODERATE3' | 'EASY2' | 'EASY1'

  @Field(type => Int)
  basketsNum: number

  @Field(type => Int)
  likesNum: number

  @Field()
  createdAt: Date

  @Field({ nullable: true })
  updatedAt?: Date

  @Field(type => Boolean)
  likedByCurrentUser: boolean

  @Field(type => Boolean)
  basketedByCurrentUser: boolean

  @Field(type => [String], { nullable: 'items' })
  tags: string[]
  // cover image
}
