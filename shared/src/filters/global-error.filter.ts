/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// global-error.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { CustomError } from "./CustomError";

const SAFE_STATUS_CODES = new Set([400, 401, 403, 404, 409, 410, 422]);

@Catch() // catches everything
export class GlobalErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (res.headersSent) return;

    const error = this.normalize(exception);
    const isProd = process.env.NODE_ENV === "production";

    return isProd ? this.sendProd(error, res) : this.sendDev(error, res);
  }

  // ─── normalize anything into a CustomError ───────────────────────
  private normalize(exception: unknown): CustomError {
    // already a CustomError
    if (exception instanceof CustomError) {
      return exception;
    }

    // NestJS built-in (NotFoundException, UnauthorizedException, etc.)
    // Inside normalize() method
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const raw: any = exception.getResponse();

      const message =
        typeof raw === "string" ? raw : (raw.message ?? exception.message);
      const errors = typeof raw === "object" ? raw.errors : undefined;
      const details = typeof raw === "object" ? raw.details : undefined;
      const type =
        typeof raw === "object" ? raw.type : this.resolveType(statusCode);

      return new CustomError(
        Array.isArray(message) ? message.join(", ") : message,
        statusCode,
        type,
        SAFE_STATUS_CODES.has(statusCode),
        details,
        errors, // Now securely passed out to your response!
      );
    }

    // plain Error
    if (exception instanceof Error) {
      console.error("Unexpected error", exception);
      return new CustomError(
        exception.message || "حدث خطأ غير متوقع",
        500,
        "server error",
        false,
      );
    }

    // totally unknown
    console.error("Unknown error type", exception);
    return new CustomError(
      "An unknown error occurred",
      500,
      "server error",
      false,
    );
  }

  // ─── response senders ────────────────────────────────────────────
  private sendDev(error: CustomError, res: Response) {
    const { statusCode, status, message, stack, type, details, errors } = error;

    console.error("🚨 Error:", {
      statusCode,
      message,
      type,
      details,
      errors,
      stack,
    });

    res.status(statusCode).json({
      status,
      statusCode,
      message,
      stack,
      type,
      details,
      errors: errors ?? {},
    });
  }

  private sendProd(error: CustomError, res: Response) {
    if (error.safe) {
      const { statusCode, status, message, type, details, errors } = error;
      res.status(statusCode).json({
        status,
        statusCode,
        message,
        type,
        details,
        errors: errors ?? {},
      });
    } else {
      console.error("Critical Error (Hidden in Response)", error);
      res.status(500).json({
        status: "error",
        message: "حدث خطأ غير متوقع",
      });
    }
  }

  private resolveType(statusCode: number): string {
    if (statusCode >= 500) return "server error";
    if (statusCode === 401) return "authentication error";
    if (statusCode === 403) return "authorization error";
    if (statusCode === 404) return "not found";
    if (statusCode === 409) return "conflict";
    return "client error";
  }
}
