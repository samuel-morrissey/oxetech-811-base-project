import { UserRepository } from "../../core/repositories/UserRepository";
import { User } from "../../types/types";
import { prisma } from "./prisma";

export class PrismaUserRepository implements UserRepository {
  async findAll(): Promise<User[]> {
    return prisma.user.findMany();
  }

  async findById(id: string): Promise<User | undefined> {
    return (await prisma.user.findUnique({ where: { id } })) ?? undefined;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return (await prisma.user.findUnique({ where: { email } })) ?? undefined;
  }
}
