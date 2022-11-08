import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { UsersModule } from 'src/users/users.module'
// import { AuthService } from './auth.service';
import { RtStrategy } from './strategies/rt.strategy'
import { ConfigModule } from '@nestjs/config'
import { AtStrategy } from './strategies/at.strategy'
import { AuthService } from './auth.service'
import { AuthResolvers } from './auth.resolvers'

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'at' }),
    JwtModule.register({}),
    ConfigModule.forRoot(),
  ],
  // controllers: [AuthController],
  providers: [AuthResolvers, AuthService, AtStrategy, RtStrategy],
})
export class AuthModule {}
