import { Module } from '@nestjs/common'
import { RecipeResolvers } from './recipe.resolvers'
import { RecipeService } from './recipe.service'
import { PrismaModule } from '../prisma/prisma.module'
import { S3Service } from 'src/s3/s3.service'

@Module({
  providers: [RecipeResolvers, RecipeService, S3Service],
  imports: [PrismaModule],
  exports: [RecipeService],
})
export class RecipeModule {}
