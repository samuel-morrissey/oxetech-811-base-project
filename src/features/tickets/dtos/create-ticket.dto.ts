import { z } from "zod";

export const createTicketSchema = z.object({
  title: z.string().trim().min(1, "Titulo obrigatorio").max(200),
  description: z
    .string()
    .trim()
    .min(1, "Descricao obrigatoria")
    .max(2000),
  category: z.string().trim().min(1).max(50),
  requesterId: z.string().min(1),
  assignedToId: z.string().min(1).optional(),
});

export type CreateTicketDto = z.infer<typeof createTicketSchema>;
