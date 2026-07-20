export type UserRole = "student" | "teacher" | "support";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
}
