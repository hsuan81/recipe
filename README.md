# Installation

Install Nest.js globally and prisma (if using yarn, change to `--dev` instead)

```
npm install install -g @nestjs/cli
cd recipe-app
npm install prisma --save-dev
```

invoke Prisma CLI locally

```
npx prisma
```

install Prisma Client locally

```
npm install @prisma/client
```

install Apollo for Express

```
npm i @nestjs/graphql @nestjs/apollo graphql apollo-server-express
```

install ts-morph package locally for Graphql schema first approach

```
npm install --save-dev ts-morph
```

install jsonwebtoken for jwt authentication

```
npm install jsonwebtoken
```

```
npm i --save-dev @types/jsonwebtoken
```

install nestjs config

```
npm i --save @nestjs/config
```

install Passport and jwt strategy

```
npm install passport-jwt
```

install argon2 package for password and refreshed token hashing

```
npm i argon2
```

install bcrypt package for password hashing

```
npm i bcrypt
npm i -D @types/bcrypt
```

# Dev with Docker

Test without authentication

```
npm run start:dev
```

# Prisma

Create first migration

```
npx prisma migrate dev --name init
```

After every change to the Prisma models and you'd like to make official change to db, you need to update the Prisma Client locally

```
npx prisma migrate
```

To seed data into database, use the custom-defined command

```
npm run seed
```

If you'd like to prototype the schema, then use the command below locally

```
npx prisma db push
```

# Graphql

Generate Graphql Typescript on demand (schema first approach)

```
npx ts-node ./src/generate-typings
```

# AWS S#

Install AWS S3 package and dependency

```
npm install @aws-sdk/client-s3
```

# Testing

Run the test

```
npm test <filename>
```
