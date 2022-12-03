// resolvers of graphql
import {
  Resolver,
  Query,
  Mutation,
  Args,
  Subscription,
  ID,
} from '@nestjs/graphql'
// import { Recipe, RecipeInput } from 'src/graphql.schema';
// import { PubSub } from 'graphql-subscriptions';
import { RecipeService } from './recipe.service'
import { Recipe, IngredientNum } from './models/recipe.model'
import { RecipeInput } from './dto/create-recipe.dto'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard'

// const pubSub = new PubSub();

@Resolver()
export class RecipeResolvers {
  constructor(private readonly recipeService: RecipeService) {}

  @Query(returns => Recipe)
  async getRecipeById(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Recipe> {
    return this.recipeService.findById(id)
  }

  @Query(returns => [Recipe])
  async getLatestRecipes(): Promise<Recipe[]> {
    return this.recipeService.getLatest()
  }

  @Query(returns => [Recipe])
  async getRecipesByTags(
    @Args('tags', { type: () => [String] }) tags: string[],
    @Args('afterId', { nullable: true }) afterId?: string,
  ) {
    return this.recipeService.getByTags(tags, afterId)
  }

  @Mutation(returns => Recipe)
  @UseGuards(GqlAuthGuard)
  async createRecipe(@Args('content') content: RecipeInput): Promise<Recipe> {
    return this.recipeService.create(content)
  }

  @Mutation(returns => Recipe)
  // @UseGuards(GqlAuthGuard)
  async updateRecipe(
    @Args('id', { type: () => ID }) id: string,
    @Args('content') content: RecipeInput,
  ): Promise<Recipe> {
    return this.recipeService.update(id, content)
  }

  @Mutation(returns => Recipe)
  // @UseGuards(GqlAuthGuard)
  async deleteRecipe(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Recipe> {
    return this.recipeService.delete(id)
  }
}
