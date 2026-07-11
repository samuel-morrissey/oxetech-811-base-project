import type { Request, Response, NextFunction } from "express";
import type { UserService } from "../services/UserService";

export class UserController {
  constructor(private userService: UserService) {}

  listUsers = (_request: Request, response: Response, next: NextFunction): void => {
    try {
      const users = this.userService.listUsers();
      response.json(users);
    } catch (error) {
      next(error);
    }
  };
}
