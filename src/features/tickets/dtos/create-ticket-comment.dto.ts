import { z } from "zod";

export const createTicketCommentBodySchema = z.object({
  message: z.string().trim().min(1, "Mensagem obrigatoria").max(2000),
  authorId: z.string().min(1, "Autor obrigatorio"),
});

export type CreateTicketCommentBody = z.infer<
  typeof createTicketCommentBodySchema
>;

export interface CreateTicketCommentDto extends CreateTicketCommentBody {
  ticketId: string;
}
