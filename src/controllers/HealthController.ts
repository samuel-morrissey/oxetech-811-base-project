import { Request, Response } from "express";

export class HealthController {
  check = (_request: Request, response: Response) => {
    response.json({ status: "ok", service: "oxetech-helpdesk" });
  };
}
