import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AppService } from './app.service'
// import { AuthService } from './auth/auth.service';
import { GqlAuthGuard } from './auth/guards/gql-auth.guard'
import { LocalAuthGuard } from './auth/guards/local-auth.guard'

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @UseGuards(GqlAuthGuard)
  @Post('auth/login')
  async login(@Request() req: any) {
    return req.user
  }

  @UseGuards(GqlAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user
  }
}
