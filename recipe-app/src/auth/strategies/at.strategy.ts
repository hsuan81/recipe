import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { User } from 'src/users/models/user.model'
import { UsersService } from 'src/users/users.service'
import { JwtPayload } from '../interfaces/jwtPayload.interface'

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('ACCESS_SECRET'),
    })
  }

  async validate(payload: JwtPayload) {
    // return await this.usersService.findOneByEmail(payload.email)
    const user = await this.usersService.findOneByEmail(payload.email)
    if (!user) {
      throw new UnauthorizedException()
    }
    return payload
  }
}
