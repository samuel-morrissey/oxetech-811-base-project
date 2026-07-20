import { Request, Response } from "express";
import { UserRepository } from "../core/repositories/UserRepository";

export class UserController {
  constructor(private readonly users: UserRepository) {}

  list = async (_request: Request, response: Response) => {
    response.json(await this.users.findAll());
  };
}
