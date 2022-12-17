// resolvers of graphql
import { UseGuards } from '@nestjs/common'
import {
  Resolver,
  Query,
  Mutation,
  Args,
  Parent,
  Subscription,
  Context,
  ID,
  ResolveField,
} from '@nestjs/graphql'
import { CurrentUser } from 'src/auth/auth.decorator'
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard'
import { User } from './models/user.model'
import { UserInput } from './dto/user-input.dto'
import { UsersService } from './users.service'
// import { Basket } from 'src/baskets/model/basket.model'
// import { BasketsService } from 'src/baskets/baskets.service'

@Resolver(() => User)
export class UsersResolvers {
  constructor(
    private readonly usersService: UsersService, // private basketsService: BasketsService,
  ) {}

  @Query(returns => User)
  async getUserById(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<User | null> {
    return this.usersService.findOneById(id)
  }

  @Query(returns => User)
  async getUserByEmail(@Args('email') email: string): Promise<User | null> {
    return this.usersService.findOneByEmail(email)
  }

  @Query(returns => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() currentUser: User): Promise<User | null> {
    return this.usersService.findOneById(currentUser.id)
  }

  @Mutation(returns => User)
  async createUser(@Args('input') input: UserInput): Promise<User> {
    return this.usersService.create(input)
  }

  // @ResolveField('basket', () => Basket)
  // async getBasket(@Parent() user: User) {
  //   const { id } = user
  //   return this.basketsService.find(id)
  // }

  // @Mutation('updateRecipe')
  // async updateRecipe(@Args('id') id: string, @Args('id') content: RecipeInputDto,): Promise<Recipe> {
  //   return this.recipeService.update(id, content);
  // }

  // @Mutation('deleteRecipe')
  // async delete(@Args('id') id: string): Promise<Recipe> {
  //   return this.recipeService.delete(id);
  // }
}
