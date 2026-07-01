import { UserRepository } from "../../core/repositories/UserRepository";
import { User } from "../../types/types";
import { DatabaseManager } from "./DatabaseManager";

export class JsonUserRepository implements UserRepository {
  findAll(): User[] {
    return DatabaseManager.getInstance().getDatabase().users;
  }

  findById(id: string): User | undefined {
    return this.findAll().find((user) => user.id === id);
  }
}
