import { Field, ID, InputType, Int } from '@nestjs/graphql'
import { Difficulty } from '../enum/difficulty.enum'
import { FileUpload } from '../interface/fileUpload.interface'
// import GraphQLUpload from 'graphql-upload-/GraphQLUpload'
import { GraphQLUpload } from 'graphql-upload-ts'

// import { IsOptional, Length, MaxLength } from 'class-validator';
// import { RecipeInput, IngredientNumInput } from '../../graphql.schema';

@InputType()
export class RecipeInput {
  @Field()
  title: string

  @Field()
  authorName: string

  @Field(type => Difficulty, { nullable: false })
  difficulty?: Difficulty

  @Field(type => [IngredientNumInput])
  ingredientsNum: IngredientNumInput[]

  @Field(type => [RecipeStepInput])
  instructions: RecipeStepInput[]

  @Field(type => Int)
  serving: number

  @Field(type => [String], { nullable: 'items' })
  tags: string[]
}

@InputType()
export class IngredientNumInput {
  @Field(type => ID, { nullable: true })
  ingredientId?: string

  @Field(type => ID, { nullable: true })
  recipeId?: string

  @Field()
  name: string

  @Field({ nullable: true })
  unit?: string

  @Field({ nullable: true })
  value?: string
}

@InputType()
export class RecipeStepInput {
  @Field(type => Int)
  stepNum: number

  @Field({ nullable: true })
  instruction?: string

  // @Field({ nullable: true })
  // imageName?: string

  // @Field()
  // url: string

  @Field(() => GraphQLUpload, { nullable: true })
  image?: Promise<FileUpload>
}
