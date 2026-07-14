import * as winston from "winston";
import { createLogger } from "./logger.factory";

export class AppLogger {
  private static loggerInstance: winston.Logger;

  /**
   * Call this once, at bootstrap, in each service's main.ts —
   */
  public static init(serviceName: string) {
    AppLogger.loggerInstance = createLogger(serviceName);
  }

  private static ensureInitialized() {
    if (!AppLogger.loggerInstance) {
      throw new Error(
        "AppLogger.init(serviceName) must be called before logging — " +
          "call it at the top of main.ts",
      );
    }
  }

  private static log(
    level: "info" | "error" | "warn",
    message: string,
    meta?: any,
  ) {
    AppLogger.ensureInitialized();
    AppLogger.loggerInstance.log(level, { message, ...meta });
  }

  public static logInfo(message: string, data?: any) {
    this.log("info", message, { data });
  }

  public static logError(message: string, error?: any) {
    this.log("error", message, {
      error: error?.stack || error,
    });
  }

  public static logWarn(message: string, data?: any) {
    this.log("warn", message, { data });
  }
}
