import { Module } from '@nestjs/common'
import { RecipeResolvers } from './recipe.resolvers'
import { RecipeService } from './recipe.service'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  providers: [RecipeResolvers, RecipeService],
  imports: [PrismaModule],
  exports: [RecipeService],
})
export class RecipeModule {}
