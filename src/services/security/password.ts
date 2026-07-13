import { createHash } from "crypto";

// Gera o hash da senha usando SHA-256, sem salt.
// Como nao ha salt, a mesma senha em texto puro sempre produz o mesmo hash.
export function hashPassword(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}
