import type { Request, Response } from "express";
import { HttpStatus } from "../../http/http-status.js";
import type { Controller } from "../../domain/controller.js";
import { getHealthStatus } from "./health.service.js";

export class HealthController implements Controller {
  index(_request: Request, response: Response): void {
    response.status(HttpStatus.OK).json(getHealthStatus());
  }
}
