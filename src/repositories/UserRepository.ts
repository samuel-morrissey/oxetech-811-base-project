import { readDatabase } from "../database";
import type { User } from "../types";

export interface IUserRepository {
  findAll(): User[];
  findById(id: string): User | undefined;
}

export class UserRepository implements IUserRepository {
  findAll(): User[] {
    const db = readDatabase();
    return db.users;
  }

  findById(id: string): User | undefined {
    const db = readDatabase();
    return db.users.find((user) => user.id === id);
  }
}
