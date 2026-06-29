import { TicketsRepository } from "../features/tickets/tickets.repository.js";
import { TicketsController } from "../features/tickets/tickets.controller.js";
import { TicketsService } from "../features/tickets/tickets.service.js";
import { UsersRepository } from "../features/users/users.repository.js";

export function createTicketsModule() {
  const usersRepository = new UsersRepository();
  const ticketsRepository = new TicketsRepository();
  const service = new TicketsService(
    ticketsRepository,
    usersRepository,
  );
  const controller = new TicketsController(service);

  return {
    controller,
    service,
    ticketsRepository,
    usersRepository,
  };
}
