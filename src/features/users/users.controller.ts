import type { Request, Response } from "express";
import { HttpStatus } from "../../http/http-status.js";
import type { Controller } from "../../domain/controller.js";
import type { UsersService } from "./users.service.js";

export class UsersController implements Controller {
  constructor(private readonly usersService: UsersService) {}

  index(_request: Request, response: Response): void {
    const users = this.usersService.list();

    response.status(HttpStatus.OK).json(users);
  }
}
