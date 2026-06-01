import { readDatabase } from "../database/jsonDatabase.js";
import type { User } from "../types.js";

export class UsersService {
  list(): User[] {
    const database = readDatabase();

    return database.users;
  }
}
