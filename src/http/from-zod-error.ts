import { ZodError } from "zod";
import { BadRequest } from "./api-error.js";

export function fromZodError(error: ZodError): BadRequest {
  return new BadRequest("Dados invalidos", {
    issues: error.issues.map((issue) => ({
      path: issue.path.join(".") || "(root)",
      message: issue.message,
    })),
  });
}
