import type { Repository } from "../../domain/repository.js";
import { readDatabase } from "../../utils/json-database.js";
import type { User } from "./types/user.js";

export class UsersRepository implements Repository<User> {
  findAll(): User[] {
    return readDatabase().users;
  }

  findById(userId: string): User | undefined {
    return readDatabase().users.find((user) => user.id === userId);
  }
}
