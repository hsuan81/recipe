import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
// import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { abortOnError: false })
  // app.use(graphqlUploadExpress({ maxFileSize: 1000000, maxFiles: 10 }))
  await app.listen(process.env.PORT || 8080)
  console.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap()
