import type { input, output, ZodType } from "zod";
import { fromZodError } from "./from-zod-error.js";

export function parseOrThrow<T extends ZodType>(
  schema: T,
  data: input<T>,
): output<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw fromZodError(result.error);
  }

  return result.data;
}
