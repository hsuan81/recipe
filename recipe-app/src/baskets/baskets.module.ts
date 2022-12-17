import { Module } from '@nestjs/common'
import { RecipeModule } from 'src/recipe/recipe.module'
import { RecipeService } from 'src/recipe/recipe.service'
import { PrismaModule } from '../prisma/prisma.module'
import { BasketsResolvers } from './baskets.resolvers'
import { BasketsService } from './baskets.service'

@Module({
  providers: [BasketsResolvers, BasketsService],
  imports: [PrismaModule, RecipeModule],
})
export class BasketsModule {}
