// resolvers of graphql
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UserInput } from 'src/users/dto/user-input.dto';
import { User } from 'src/users/models/user.model';
import { CurrentUser } from './auth.decorator';
import { AuthService } from './auth.service';
import { GqlAuthRefreshGuard } from './guards/gql-auth-refresh.guard';
import { LoginResult } from './interfaces/login.model';
import { Tokens } from './interfaces/tokens.model';


@Resolver('Auth')
export class AuthResolvers {
  constructor(private readonly authService: AuthService) {}

  @Mutation()
  async login(@Args('loginAttempt') loginAttempt: UserInput): Promise<LoginResult | undefined> {
    return this.authService.login(loginAttempt);
  }

  @Mutation()
  async logout(@Args('userId') userId: string): Promise<Boolean> {
    return this.authService.logout(userId);
  }

  @Mutation()
  async signUp(@Args('signUpInput') signUpInput: UserInput): Promise<Tokens> {
    return this.authService.signUp(signUpInput);
  }
  
  // There is no username guard here because if the person has the token, they can be any user
  @Mutation()
  @UseGuards(GqlAuthRefreshGuard)
  async refreshTokens(@CurrentUser() currentUser: User, @Args('userId') userId: string, @Args('rt') rt: string): Promise<Tokens> {
    if (!currentUser || !currentUser.hashedRt)
      throw new UnauthorizedException(
        'Could not log-in with the provided credentials',
      );
    return this.authService.refreshTokens(currentUser.id, currentUser.hashedRt);
  }

  // @Mutation('deleteRecipe')
  // async delete(@Args('id') id: string): Promise<Recipe> {
  //   return this.recipeService.delete(id);
  // }
}