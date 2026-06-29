import type { Repository } from "../../domain/repository.js";
import type { Service } from "../../domain/service.js";
import {
  toPublicUser,
  type PublicUser,
} from "./dtos/public-user.dto.js";
import type { User } from "./types/user.js";

export class UsersService implements Service {
  constructor(private readonly usersRepository: Repository<User>) {}

  list(): PublicUser[] {
    return this.usersRepository.findAll().map(toPublicUser);
  }
}
