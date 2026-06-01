import type { UsersRepository } from "./users.repository.js";
import type { User } from "./types/user.js";

export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  list(): User[] {
    return this.usersRepository.findAll();
  }
}
