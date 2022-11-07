// resolvers of graphql
import { UseGuards } from '@nestjs/common'
import {
  Resolver,
  Query,
  Mutation,
  Args,
  Subscription,
  Context,
  ID,
} from '@nestjs/graphql'
import { CurrentUser } from 'src/auth/auth.decorator'
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard'
import { User } from './models/user.model'
import { UserInput } from './dto/user-input.dto'
import { UsersService } from './users.service'

// const pubSub = new PubSub();

@Resolver('Users')
export class UsersResolvers {
  constructor(private readonly usersService: UsersService) {}

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

  // @Mutation('updateRecipe')
  // async updateRecipe(@Args('id') id: string, @Args('id') content: RecipeInputDto,): Promise<Recipe> {
  //   return this.recipeService.update(id, content);
  // }

  // @Mutation('deleteRecipe')
  // async delete(@Args('id') id: string): Promise<Recipe> {
  //   return this.recipeService.delete(id);
  // }
}
