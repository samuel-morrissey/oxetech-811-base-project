import { UsersRepository } from "../features/users/users.repository.js";
import { UsersController } from "../features/users/users.controller.js";
import { UsersService } from "../features/users/users.service.js";

export function createUsersModule() {
  const usersRepository = new UsersRepository();
  const service = new UsersService(usersRepository);
  const controller = new UsersController(service);

  return {
    controller,
    service,
    usersRepository,
  };
}
