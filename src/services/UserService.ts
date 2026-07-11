import type { IUserRepository } from "../repositories/UserRepository";
import type { PublicUser } from "../types";

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  listUsers(): PublicUser[] {
    const users = this.userRepository.findAll();
    return users.map(({ password: _password, ...rest }) => rest);
  }
}
