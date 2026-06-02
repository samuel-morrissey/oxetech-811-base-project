import { ID } from "../constants";

export function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * ID.RANDOM_MAX)}`;
}
