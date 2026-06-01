import type { User } from "../types/user.js";
import type { Database } from "../../../utils/database-type.js";

export function findUserById(
  database: Database,
  userId: string,
): User | undefined {
  return database.users.find((user) => user.id === userId);
}
