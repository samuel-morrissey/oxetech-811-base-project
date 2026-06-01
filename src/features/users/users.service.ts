import { readDatabase } from "../../utils/json-database.js";
import type { User } from "./types/user.js";

export class UsersService {
  list(): User[] {
    const database = readDatabase();

    return database.users;
  }
}
