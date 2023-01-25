import * as argon2 from 'argon2'
import {
  ForbiddenException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import { JwtService } from '@nestjs/jwt'
import { UserInput } from 'src/users/dto/user-input.dto'
import { Tokens } from './interfaces/tokens.model'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { JwtPayload } from './interfaces/jwtPayload.interface'
import { ConfigService } from '@nestjs/config'
import { LoginResult } from './interfaces/login.model'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signUp(signUpInput: UserInput): Promise<Tokens> {
    const hash = await argon2.hash(signUpInput.password)

    const user = await this.usersService
      .create({ ...signUpInput, password: hash })
      .catch(error => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new Error('This email address has been registered.')
          }
        }
        throw error
      })

    const tokens = await this.getTokens(user.id, user.email)
    await this.updateRtHash(user.id, tokens.refresh_token)

    return tokens
  }

  async login(loginAttempt: UserInput): Promise<LoginResult | undefined> {
    const user = await this.usersService.findOneByEmail(loginAttempt.email)
    if (!user) {
      throw new ForbiddenException('Could not find the user')
      // throw new NotAcceptableException('Could not find the user.')
    }
    const password = user && (await this.usersService.getPassword(user.id))
    if (user && (await argon2.verify(password, loginAttempt.password))) {
      const tokens = await this.getTokens(user.id, user.email)
      await this.updateRtHash(user.id, tokens.refresh_token)

      return { user, tokens }
      // const payload = { username: user.email, sub: user.id }
      // const accessToken = this.jwtService.sign(payload)
      // return { user, token: accessToken }
    }
    return undefined
  }

  async checkPassword(userId: string, password: string): Promise<boolean> {
    const hashedPassword = await argon2.hash(password)
    const passwordFromDB = await this.usersService.getPassword(userId)
    return hashedPassword === passwordFromDB
  }

  async resetPassword(userId: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await argon2.hash(newPassword)
    const updatedPwd = await this.usersService.changePassword(
      userId,
      hashedPassword,
    )
    return updatedPwd === hashedPassword
  }

  async logout(userId: string): Promise<Boolean> {
    const logoutResult = await this.usersService.resetUserRt(userId)
    return logoutResult === 1
  }

  async refreshTokens(userId: string, rt: string): Promise<Tokens> {
    const user = await this.usersService.findOneById(userId)
    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied')

    const rtMatches = await argon2.verify(user.hashedRt, rt)
    if (!rtMatches) throw new ForbiddenException('Access Denied')

    const tokens = await this.getTokens(user.id, user.email)
    await this.updateRtHash(user.id, tokens.refresh_token)

    return tokens
  }

  private async updateRtHash(userId: string, rt: string): Promise<void> {
    const hash = await argon2.hash(rt)
    await this.usersService.saveHashedRt(userId, hash)
  }

  private async getTokens(userId: string, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    }

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ])

    return {
      access_token: at,
      refresh_token: rt,
    }
  }
}
