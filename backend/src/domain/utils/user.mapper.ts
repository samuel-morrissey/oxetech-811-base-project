import type { SanitizedUser, User } from "../types";

export function sanitizeUser(user: User): SanitizedUser;
export function sanitizeUser(user: undefined): undefined;
export function sanitizeUser(user: User | undefined): SanitizedUser | undefined;
export function sanitizeUser(user: User | undefined): SanitizedUser | undefined {
  if (!user) return undefined;
  const { password, ...sanitized } = user;
  return sanitized;
}
