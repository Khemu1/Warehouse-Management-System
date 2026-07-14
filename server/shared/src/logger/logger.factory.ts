// shared/src/logger/logger.factory.ts
import * as winston from "winston";
import "winston-daily-rotate-file";
import * as fs from "fs";

export function createLogger(serviceName: string) {
  const logDir = process.env.LOG_DIR || `/var/log/${serviceName}`;

  // Fail with a clear, actionable message instead of a raw fs stack trace
  try {
    fs.mkdirSync(logDir, { recursive: true });
  } catch (err: any) {
    throw new Error(
      `AppLogger: cannot create log directory "${logDir}" (${err.code}). ` +
        `Either run: sudo mkdir -p ${logDir} && sudo chown -R $USER:$USER ${logDir}, ` +
        `or set LOG_DIR to a path you own (e.g. LOG_DIR=./logs) for local development.`,
    );
  }

  return winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    defaultMeta: { service: serviceName },
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
    transports: [
      new winston.transports.Console({
        format:
          process.env.NODE_ENV === "development"
            ? winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
              )
            : winston.format.json(),
      }),
      new winston.transports.DailyRotateFile({
        filename: `${logDir}/%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "14d",
      }),
    ],
  });
}
