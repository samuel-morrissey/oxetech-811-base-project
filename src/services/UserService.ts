import type { IUserRepository } from "../repositories/UserRepository";
import type { User, PublicUser } from "../types";

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  listUsers(): PublicUser[] {
    const users = this.userRepository.findAll();
    return users.map(toPublicUser);
  }
}

export function toPublicUser(user: User): PublicUser {
  const { password: _password, ...rest } = user;
  return rest;
}
