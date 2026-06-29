type LogMeta = Record<string, string | number | boolean>;

export const logger = {
  info(message: string, meta?: LogMeta): void {
    if (process.env.NODE_ENV === "test") {
      return;
    }

    const suffix = meta ? ` ${JSON.stringify(meta)}` : "";
    console.log(`[helpdesk] ${message}${suffix}`);
  },

  error(message: string, error?: Error): void {
    if (process.env.NODE_ENV === "test") {
      return;
    }

    console.error(`[helpdesk] ${message}`, error ?? "");
  },
};
