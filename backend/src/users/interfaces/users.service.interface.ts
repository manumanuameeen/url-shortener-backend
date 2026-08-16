import { User, Prisma } from '@prisma/client';

export abstract class IUsersService {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract createUser(data: Prisma.UserCreateInput): Promise<User>;
  abstract updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User>;
}
