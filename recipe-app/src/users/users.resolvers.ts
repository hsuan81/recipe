// resolvers of graphql
import { Resolver, Query, Mutation, Args, Subscription, Context } from '@nestjs/graphql';
import { User } from 'src/graphql.schema';
import { UserInput } from './dto/user-input.dto';
import { UsersService } from './users.service';

// const pubSub = new PubSub();

@Resolver('Users')
export class UsersResolvers {
  constructor(private readonly usersService: UsersService) {}

  @Query()
  async getUserById(@Args('id') id: string): Promise<User | undefined> {
    return this.usersService.findOneById(id);
  }

  @Query()
  async getUserByEmail(@Args('email') email: string): Promise<User | undefined> {
    return this.usersService.findOneByEmail(email);
  }

  @Query()
	async me(@Context('currentUser') currentUser: User): Promise<User> {
		return currentUser
	}

  @Mutation()
  async createRecipe(@Args('input') input: UserInput): Promise<User> {
    return this.usersService.create(input);
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