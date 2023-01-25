// resolvers of graphql
import { UnauthorizedException, UseGuards } from '@nestjs/common'
import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql'
import { UserInput } from 'src/users/dto/user-input.dto'
import { User } from 'src/users/models/user.model'
import { CurrentUser } from './auth.decorator'
import { AuthService } from './auth.service'
import { GqlAuthRefreshGuard } from './guards/gql-auth-refresh.guard'
import { GqlAuthGuard } from './guards/gql-auth.guard'
import { LoginResult } from './interfaces/login.model'
import { Tokens } from './interfaces/tokens.model'

@Resolver('Auth')
export class AuthResolvers {
  constructor(private readonly authService: AuthService) {}

  @Query(returns => Boolean)
  @UseGuards(GqlAuthGuard)
  async checkPassword(
    @CurrentUser() currentUser: User,
    @Args('password') password: string,
  ): Promise<boolean> {
    return await this.authService.checkPassword(currentUser.id, password)
  }

  @Mutation(returns => LoginResult)
  async login(
    @Args('loginAttempt') loginAttempt: UserInput,
  ): Promise<LoginResult | undefined> {
    return this.authService.login(loginAttempt)
  }

  @Mutation(returns => Boolean)
  async logout(@Args('userId') userId: string): Promise<Boolean> {
    return this.authService.logout(userId)
  }

  @Mutation(returns => Tokens)
  async signUp(@Args('signUpInput') signUpInput: UserInput): Promise<Tokens> {
    return this.authService.signUp(signUpInput)
  }

  @Mutation(returns => Boolean)
  async resetPassword(
    @CurrentUser() currentUser: User,
    @Args('newPassword') newPassword: string,
  ): Promise<boolean> {
    return this.authService.resetPassword(currentUser.id, newPassword)
  }

  // There is no username guard here because if the person has the token, they can be any user
  @Mutation(returns => Tokens)
  @UseGuards(GqlAuthRefreshGuard)
  async refreshTokens(
    @CurrentUser() currentUser: User,
    @Args('userId') userId: string,
    @Args('rt') rt: string,
  ): Promise<Tokens> {
    if (!currentUser || !currentUser.hashedRt)
      throw new UnauthorizedException(
        'Could not log-in with the provided credentials',
      )
    return this.authService.refreshTokens(currentUser.id, currentUser.hashedRt)
  }

  // @Mutation('deleteRecipe')
  // async delete(@Args('id') id: string): Promise<Recipe> {
  //   return this.recipeService.delete(id);
  // }
}
