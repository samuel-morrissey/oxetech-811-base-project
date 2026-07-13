import { CommentRepository } from "../../core/repositories/CommentRepository";
import { TicketComment } from "../../types/types";
import { prisma } from "./prisma";

export class PrismaCommentRepository implements CommentRepository {
  async findByTicketId(ticketId: string): Promise<TicketComment[]> {
    const rows = await prisma.ticketComment.findMany({ where: { ticketId } });
    return rows.map((row) => ({
      id: row.id,
      ticketId: row.ticketId,
      authorId: row.authorId,
      message: row.message,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async findById(id: string): Promise<TicketComment | undefined> {
    const row = await prisma.ticketComment.findUnique({ where: { id } });
    if (!row) return undefined;
    return {
      id: row.id,
      ticketId: row.ticketId,
      authorId: row.authorId,
      message: row.message,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async add(comment: TicketComment): Promise<void> {
    // Monta o INSERT concatenando os valores diretamente na string SQL.
    // A coluna "message" e a ultima do VALUES e vai crua para o banco.
    await prisma.$executeRawUnsafe(
      `INSERT INTO "TicketComment" (id, "ticketId", "authorId", "createdAt", message) ` +
        `VALUES ('${comment.id}', '${comment.ticketId}', '${comment.authorId}', '${comment.createdAt}', '${comment.message}')`,
    );
  }

  async update(comment: TicketComment): Promise<void> {
    await prisma.ticketComment.update({
      where: { id: comment.id },
      data: { message: comment.message },
    });
  }
}
