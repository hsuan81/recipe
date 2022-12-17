import { UseGuards } from '@nestjs/common'
import {
  Resolver,
  Query,
  Mutation,
  Args,
  Subscription,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql'
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard'
import { Recipe } from 'src/recipe/models/recipe.model'
import { BasketsService } from './baskets.service'
import { Basket } from './model/basket.model'

@Resolver()
// @UseGuards(GqlAuthGuard)
export class BasketsResolvers {
  constructor(private readonly basketsService: BasketsService) {}

  @Query(returns => Basket)
  async getBasketByUserId(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<Basket> {
    return await this.basketsService.find(userId)
  }

  @Mutation(returns => Basket)
  async addRecipeToBasket(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('recipeId', { type: () => ID }) recipeId: string,
  ): Promise<Basket> {
    return await this.basketsService.add(userId, recipeId)
  }

  @Mutation(returns => Basket)
  async removeRecipeFromBasket(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('recipeId', { type: () => ID }) recipeId: string,
  ): Promise<Basket> {
    return await this.basketsService.remove(userId, recipeId)
  }
}
