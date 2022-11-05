import { Field, ID, InputType, Int } from '@nestjs/graphql'
import { Difficulty } from '../enum/difficulty.enum'
// import { IsOptional, Length, MaxLength } from 'class-validator';
// import { RecipeInput, IngredientNumInput } from '../../graphql.schema';

@InputType()
export class RecipeInput {
  @Field()
  title: string

  @Field()
  authorId: string

  @Field(type => Difficulty, { nullable: false })
  difficulty?: Difficulty

  @Field(type => [IngredientNumInput])
  ingredientsNum: IngredientNumInput[]

  @Field(type => [String])
  instructions: string[]

  @Field(type => Int)
  serving: number
}

@InputType()
export class IngredientNumInput {
  @Field(type => ID)
  ingredientId: string

  @Field(type => ID)
  recipeId: string

  @Field()
  name: string

  @Field()
  unit: string

  @Field()
  value: string
}
