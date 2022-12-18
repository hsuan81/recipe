import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AppConfigService {
  static service: ConfigService

  constructor(service: ConfigService) {
    AppConfigService.service = service
  }

  static get(key: string): any {
    return AppConfigService.service.get(key)
  }
}
