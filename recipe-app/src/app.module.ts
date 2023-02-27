import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { join } from 'path'
import { RecipeModule } from './recipe/recipe.module'
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { BasketsModule } from './baskets/baskets.module'
import { S3Service } from './s3/s3.service'
import { AppConfigService } from './appconfig/appconfig.service'

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      /* Schema first setting for Graphql*/
      // typePaths: ['./**/*.graphql'],
      // definitions: {
      //   path: join(process.cwd(), 'src/graphql.ts'), // to automatically generate ts definition
      //   outputAs: 'class',
      // },
      /* Code first setting for Graphql */
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      // sortSchema: true,
      debug: false,
      playground: false,
      introspection: process.env.NODE_ENV !== 'production',
      // cors: true, // allow requests from outside networks
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    RecipeModule,
    UsersModule,
    AuthModule,
    BasketsModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService, S3Service, AppConfigService],
})
export class AppModule {}
