// resolvers of graphql
import {
  Resolver,
  Query,
  Mutation,
  Args,
  Subscription,
  ID,
  Int,
} from '@nestjs/graphql'
// import { Recipe, RecipeInput } from 'src/graphql.schema';
// import { PubSub } from 'graphql-subscriptions';
import { RecipeService } from './recipe.service'
import { Recipe, IngredientNum } from './models/recipe.model'
import { RecipeInput } from './dto/create-recipe.dto'
import { CurrentUser } from 'src/auth/auth.decorator'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard'
import { User } from 'src/users/models/user.model'
import { RecipeSummary } from './models/recipeSummary.model'
import { Difficulty } from './enum/difficulty.enum'

// const pubSub = new PubSub();

@Resolver()
export class RecipeResolvers {
  constructor(private readonly recipeService: RecipeService) {}

  @Query(returns => RecipeSummary)
  async getRecipeById(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser?: User,
  ): Promise<RecipeSummary> {
    return this.recipeService.getById(id, currentUser?.id)
  }

  @Query(returns => [RecipeSummary])
  async getLatestRecipes(
    @Args('afterId', { nullable: true }) afterId?: string,
    @CurrentUser() currentUser?: User,
  ): Promise<RecipeSummary[]> {
    return this.recipeService.getLatest(afterId, currentUser?.id)
  }

  @Query(returns => Int)
  async getLatestLikeNum(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Number> {
    return this.recipeService.getLikesNum(id)
  }

  @Query(returns => Int)
  async getLatestBasketNum(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Number> {
    return this.recipeService.getLikesNum(id)
  }

  @Query(returns => [RecipeSummary])
  async getRecipesByTags(
    @Args('tags', { type: () => [String] }) tags: string[],
    @Args('afterId', { nullable: true }) afterId?: string,
    @CurrentUser() currentUser?: User,
  ): Promise<RecipeSummary[]> {
    return this.recipeService.getByTags(tags, afterId, currentUser?.id)
  }

  @Query(returns => [RecipeSummary])
  async getRecipesByDifficulty(
    @Args('difficulty', { type: () => Difficulty }) difficulty: Difficulty,
    @Args('afterId', { nullable: true }) afterId?: string,
    @CurrentUser() currentUser?: User,
  ): Promise<RecipeSummary[]> {
    return this.recipeService.getByDifficulty(
      difficulty,
      afterId,
      currentUser?.id,
    )
  }

  @Mutation(returns => Recipe)
  @UseGuards(GqlAuthGuard)
  async createRecipe(@Args('content') content: RecipeInput): Promise<Recipe> {
    return this.recipeService.create(content)
  }

  @Mutation(returns => Int)
  @UseGuards(GqlAuthGuard)
  async likeRecipe(
    @CurrentUser() currentUser: User,
    // @Args('userId') userId: string,
    @Args('recipeId') recipeId: string,
  ): Promise<Number> {
    // return this.recipeService.favorite(userId, recipeId)
    return this.recipeService.favorite(currentUser.id, recipeId)
  }

  @Mutation(returns => Int)
  @UseGuards(GqlAuthGuard)
  async unLikeRecipe(
    @CurrentUser() currentUser: User,
    // @Args('userId') userId: string,
    @Args('recipeId') recipeId: string,
  ): Promise<Number> {
    // return this.recipeService.unFavorite(userId, recipeId)
    return this.recipeService.unFavorite(currentUser.id, recipeId)
  }

  @Mutation(returns => Recipe)
  @UseGuards(GqlAuthGuard)
  async updateRecipe(
    @Args('id', { type: () => ID }) id: string,
    @Args('content') content: RecipeInput,
  ): Promise<Recipe> {
    return this.recipeService.update(id, content)
  }

  @Mutation(returns => RecipeSummary)
  @UseGuards(GqlAuthGuard)
  async deleteRecipe(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<RecipeSummary> {
    return this.recipeService.delete(id, currentUser.id)
  }
}
