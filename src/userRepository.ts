import { readDatabase } from "./database";
import type { User } from "./types";

export function findAllUsers(): User[] {
  const database = readDatabase();
  return database.users;
}

export function findUserById(id: string): User | undefined {
  const database = readDatabase();
  return database.users.find((user) => user.id === id);
}