import { z } from "zod";

const queryString = z.preprocess(
  (value) => (typeof value === "string" ? value : undefined),
  z.string().optional(),
);

export const listTicketsQuerySchema = z.object({
  status: queryString,
  category: queryString,
  search: queryString,
});

export type ListTicketsDto = z.infer<typeof listTicketsQuerySchema>;
