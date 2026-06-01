import { Router, type Request, type Response } from "express";
import { HttpStatus } from "../http/http-status.js";

const router = Router();

router.get("/", (_request: Request, response: Response) =>
  response
    .status(HttpStatus.OK)
    .json({ status: "ok", service: "oxetech-helpdesk" }),
);

export { router as healthRouter };
