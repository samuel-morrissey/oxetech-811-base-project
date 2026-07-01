import { User } from "../../types/types";

export interface UserRepository {
  findAll(): User[];
  findById(id: string): User | undefined;
}
