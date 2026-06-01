import type { Database, User } from "../types.js";

export function findUserById(
  database: Database,
  userId: string,
): User | undefined {
  return database.users.find((user) => user.id === userId);
}
