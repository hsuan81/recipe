import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { BasketsResolvers } from './baskets.resolvers'
import { BasketsService } from './baskets.service'

@Module({
  providers: [BasketsResolvers, BasketsService],
  imports: [PrismaModule],
})
export class BasketsModule {}
