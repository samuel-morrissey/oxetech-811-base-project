import type { Request, Response } from "express";

import { SERVICE } from "../constants";

export function getHealth(_request: Request, response: Response): void {
  response.json({ status: SERVICE.HEALTH_OK, service: SERVICE.NAME });
}
