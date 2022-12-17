import { Module } from '@nestjs/common'
import { BasketsModule } from 'src/baskets/baskets.module'
import { BasketsService } from 'src/baskets/baskets.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { UsersResolvers } from './users.resolvers'
import { UsersService } from './users.service'

@Module({
  providers: [UsersResolvers, UsersService],
  imports: [PrismaModule],
  exports: [UsersService],
})
export class UsersModule {}
