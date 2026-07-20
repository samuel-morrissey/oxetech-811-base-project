import type { Repository } from "../../domain/repository.js";
import type { Service } from "../../domain/service.js";
import type { User } from "./types/user.js";

export class UsersService implements Service {
  constructor(private readonly usersRepository: Repository<User>) {}

  list(): User[] {
    return this.usersRepository.findAll();
  }
}
