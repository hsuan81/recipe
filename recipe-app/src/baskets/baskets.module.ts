import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { BasketsService } from './baskets.service'

@Module({
  providers: [BasketsService],
  imports: [PrismaModule],
})
export class BasketsModule {}
