import { pino } from "pino";

export function createLogger(level: string) {
  return pino({
    level,
    transport:
      process.env.NODE_ENV === "production"
        ? undefined
        : {
            target: "pino-pretty",
            options: { colorize: true, translateTime: "SYS:HH:MM:ss" },
          },
    redact: {
      paths: [
        "*.secretKey",
        "*.privateKey",
        "secretKey",
        "privateKey",
        "*.keypair",
      ],
      remove: true,
    },
  });
}

export type Logger = ReturnType<typeof createLogger>;
