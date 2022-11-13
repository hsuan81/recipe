// import {
//   CallHandler,
//   ExecutionContext,
//   Injectable,
//   NestInterceptor,
// } from '@nestjs/common'
// import { GqlExecutionContext } from '@nestjs/graphql'
// import { Response } from 'express'
// import { Observable } from 'rxjs'

// @Injectable()
// export class VersionHeaderInterceptor implements NestInterceptor {
//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     // When the request is GraphQL
//     if ((context.getType() as string) === 'graphql') {
//       const gqlExecutionContext = GqlExecutionContext.create(context)
//       const response: Response = gqlExecutionContext.getContext().res
//       response.setHeader('x-version', process.env.npm_package_version)
//     }

//     // When the request is HTTP
//     if (context.getType() === 'http') {
//       const http = context.switchToHttp()
//       const response: Response = http.getResponse()
//       response.setHeader('x-version', process.env.npm_package_version)
//     }

//     return next.handle()
//   }
// }
