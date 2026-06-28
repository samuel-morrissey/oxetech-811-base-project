import type { User } from "../types/user.js";

export type PublicUser = Omit<User, "password">;

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
