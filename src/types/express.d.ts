import type { ListTicketsDto } from "../features/tickets/dtos/list-tickets.dto.js";

declare global {
  namespace Express {
    interface Locals {
      validatedQuery?: ListTicketsDto;
    }
  }
}

export {};
