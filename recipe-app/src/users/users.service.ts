import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common'
// import { AuthService } from '../auth/auth.service';
import { User as PrismaUser } from '@prisma/client'
import { UserInput } from './dto/user-input.dto'
// import { GQLRecipe } from 'src/recipe/recipe.service';
import { PrismaService } from 'src/prisma/prisma.service'
import { User } from './models/user.model'

// export type GQLUser = {
//   id: string,
//   email: string,
//   name: string | null,
// }

// export type User = any;

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService, //   private authService: AuthService,
  ) {}

  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ]

  // async findOne(username: string): Promise<User | undefined> {
  //   return this.users.find(user => user.username === username);
  // }

  /**
   * Creates a user
   *
   * @param {CreateUserInput} createUserInput username, email, and password. Username and email must be
   * unique, will throw an email with a description if either are duplicates
   * @returns {Promise<UserDocument>} or throws an error
   * @memberof UsersService
   */
  async create(createUserInput: UserInput): Promise<User> {
    const { email, name, password } = createUserInput
    // const existingUser = await this.prisma.user.findUnique({ where: { email } })
    // if (existingUser) {
    //   throw new Error('This email address has been registered.')
    // }

    let defaultName

    if (name === undefined) {
      defaultName = email.split('@')[0]
    } else defaultName = name

    const createdUser = await this.prisma.user.create({
      data: {
        email,
        name: defaultName,
        password,
      },
    })
    return this._parse(createdUser)
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
    })
    // if (!user) {
    //   return null
    // }
    return this._parse(user)
  }

  async findOneByName(name: string): Promise<User> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { name },
    })
    return this._parse(user)
  }
  // ---------------------------------------------------------
  /**
   * Returns a user by their unique email address or undefined
   *
   * @param {string} email address of user, not case sensitive
   * @returns {(Promise<UserDocument | undefined>)}
   * @memberof UsersService
   */
  async findOneByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { email },
      include: {
        favorite: {
          include: { recipes: true },
        },
      },
    })
    // if (!user) {
    //   return null
    // }
    return this._parse(user)
  }

  async changePassword(id: string, newPwd: string): Promise<string> {
    const { password } = await this.prisma.user.update({
      where: { id },
      data: { password: newPwd },
      select: {
        password: true,
      },
    })
    return password
  }

  async getPassword(id: string): Promise<string> {
    const userPass = await this.prisma.user.findFirstOrThrow({
      where: { id },
      select: {
        password: true,
      },
    })
    return userPass.password
  }

  // ----------------------------------------------------------
  /**
   * Deletes all the users in the database, used for testing
   *
   * @returns {Promise<void>}
   * @memberof UsersService
   */
  // async deleteAllUsers(): Promise<void> {
  //     await this.userModel.deleteMany({});
  // }

  async saveHashedRt(id: string, hashedRt: string): Promise<User> {
    const updated = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        hashedRt,
      },
      include: {
        favorite: {
          include: { recipes: true },
        },
      },
    })
    return this._parse(updated)
  }

  async resetUserRt(id: string): Promise<number> {
    const updatedCount = await this.prisma.user.updateMany({
      where: {
        id: id,
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    })
    return updatedCount.count
  }

  _parse(prismaUser: PrismaUser): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      hashedRt: prismaUser.hashedRt ? prismaUser.hashedRt : undefined,
    }
  }
}
