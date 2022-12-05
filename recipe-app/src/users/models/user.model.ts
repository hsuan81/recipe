import { Field, ID, ObjectType } from '@nestjs/graphql'
import { Recipe } from 'src/recipe/models/recipe.model'

@ObjectType({
  description: 'Liked Recipes',
})
export class Favorite {
  @Field(type => ID)
  id: string

  @Field(type => [String])
  recipes: string[]
}

@ObjectType()
export class User {
  @Field(type => ID)
  id: string

  @Field()
  email: string

  @Field()
  name: string

  @Field({ nullable: true })
  hashedRt?: string

  @Field(type => Favorite, { nullable: true })
  favorite?: Favorite
}
