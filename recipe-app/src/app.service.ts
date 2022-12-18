import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AppService {
  private readonly config: ConfigService

  constructor(config: ConfigService) {
    this.config = config
  }
  getHello(): string {
    return 'Hello World!'
  }
}
