import { Field, ID, Int, ObjectType } from '@nestjs/graphql'
import { IngredientNum, Recipe } from 'src/recipe/models/recipe.model'
import { RecipeSummary } from 'src/recipe/models/recipeSummary.model'
// import { IngredientNum } from 'src/graphql.schema';

// export type Difficulty = 'ACTIVE' | 'ARCHIVE' | 'DELETE' | 'DRAFT' | 'LOCK' | 'REPORTED';

@ObjectType({
  description:
    'basket which is a list of all ingredients and their amount for preparation',
})
export class Basket {
  @Field(type => ID)
  id: string

  @Field(type => ID)
  userId: string

  @Field(type => [IngredientNum], { nullable: 'items' })
  ingredientsNum: IngredientNum[]

  // @Field(type => [RecipeSummary])
  // recipes: RecipeSummary[]
}

// @ObjectType({
//   description: 'The combination of ingredient and its number for the recipe',
// })
// export class IngredientNum {
//   @Field(type => ID)
//   ingredientId: string

//   @Field(type => ID)
//   recipeId: string

//   @Field()
//   name: string

//   @Field()
//   unit: string

//   @Field()
//   value: string
// }
