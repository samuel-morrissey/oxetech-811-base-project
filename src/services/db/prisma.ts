import { PrismaClient } from "@prisma/client";

// Cliente Prisma compartilhado por toda a aplicacao.
export const prisma = new PrismaClient();
