import { Field, ID, Int, ObjectType } from '@nestjs/graphql'
import { Difficulty } from '../enum/difficulty.enum'
// import { IngredientNum } from 'src/graphql.schema';

// export type Difficulty = 'ACTIVE' | 'ARCHIVE' | 'DELETE' | 'DRAFT' | 'LOCK' | 'REPORTED';

@ObjectType({ description: 'recipe ' })
export class Recipe {
  @Field(type => ID)
  id: string

  @Field(type => ID)
  authorId: string

  @Field()
  authorName: string

  @Field()
  title: string

  @Field(type => Difficulty)
  difficulty: Difficulty[keyof Difficulty]
  // difficulty?: 'DIFFICULT5' | 'DIFFICULT4' | 'MODERATE3' | 'EASY2' | 'EASY1'

  @Field(type => [IngredientNum])
  ingredientsNum: IngredientNum[]

  @Field(type => [RecipeStep], { nullable: 'items' })
  instructions: RecipeStep[]

  @Field(type => Int)
  likesNum: number

  @Field(type => Boolean)
  likedByCurrentUser: boolean

  @Field(type => Boolean)
  basketedByCurrentUser: boolean

  @Field(type => Int)
  basketsNum: number

  @Field(type => Int)
  serving: number

  @Field(type => [String], { nullable: 'items' })
  tags: string[]

  @Field()
  createdAt: Date

  @Field({ nullable: true })
  updatedAt?: Date
}

@ObjectType({
  description: 'The combination of ingredient and its number for the recipe',
})
export class IngredientNum {
  @Field(type => ID)
  ingredientId: string

  @Field(type => ID)
  recipeId: string

  @Field()
  name: string

  @Field({ nullable: true })
  unit?: string

  @Field({ nullable: true })
  value?: string
}

@ObjectType({ description: 'The instruction of one step and its image.' })
export class RecipeStep {
  @Field(type => ID)
  id: string

  @Field(type => ID)
  recipeId: string

  @Field(type => Int)
  stepNum: number

  @Field({ nullable: true })
  instruction?: string

  @Field({ nullable: true })
  imageName?: string

  @Field({ nullable: true })
  imageUrl?: string
}
