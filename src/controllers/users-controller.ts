import type { Request, Response } from "express";
import { HttpStatus } from "../http/http-status.js";
import type { UsersService } from "../services/users-service.js";
import type { Controller } from "./controller.js";

export class UsersController implements Controller {
  constructor(private readonly usersService: UsersService) {}

  index(_request: Request, response: Response): void {
    const users = this.usersService.list();

    response.status(HttpStatus.OK).json(users);
  }
}
