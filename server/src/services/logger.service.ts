import winston from "winston";
import { Request } from "express";
import path from "path";

export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  HTTP = "http",
  DEBUG = "debug",
}

interface LogMetadata {
  timestamp: string;
  context?: string;
  requestId?: string;
  userId?: number;
  additionalInfo?: Record<string, any>;
  body?: any;
  params?: any;
  query?: any;
  duration?: any;
  operation?: any;
}

export class Logger {
  private logger: winston.Logger;
  private context: string;

  constructor(context: string) {
    this.context = context;
    this.logger = this.initializeLogger();
  }

  private initializeLogger(): winston.Logger {
    const logDir = path.join(process.cwd(), "logs");

    const customFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, context, requestId, userId, ...meta }: any) => {
        const metadataStr = Object.keys(meta).length ? `\nMetadata: ${JSON.stringify(meta, null, 2)}` : "";
        return `[${timestamp}] [${level.toUpperCase()}] [${context || this.context}]${requestId ? ` [ReqID: ${requestId}]` : ""}${userId ? ` [UserID: ${userId}]` : ""}: ${message}${metadataStr}`;
      }),
    );

    return winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: customFormat,
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), customFormat),
        }),

        new winston.transports.File({
          filename: path.join(logDir, "error.log"),
          level: "error",
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),

        new winston.transports.File({
          filename: path.join(logDir, "combined.log"),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    });
  }

  private formatMessage(message: string, error?: Error | unknown): string {
    if (error instanceof Error) {
      return `${message} - ${error.message}\nStack: ${error.stack}`;
    }
    return message;
  }

  private createLogMetadata(metadata?: Partial<LogMetadata>): LogMetadata {
    return {
      timestamp: new Date().toISOString(),
      context: this.context,
      ...metadata,
    };
  }

  error(message: string, error?: Error | unknown, metadata?: Partial<LogMetadata>): void {
    this.logger.error(this.formatMessage(message, error), {
      ...this.createLogMetadata(metadata),
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : error,
    });
  }

  warn(message: string, metadata?: Partial<LogMetadata>): void {
    this.logger.warn(message, this.createLogMetadata(metadata));
  }

  info(message: string, metadata?: Partial<LogMetadata>): void {
    this.logger.info(message, this.createLogMetadata(metadata));
  }

  debug(message: string, metadata?: Partial<LogMetadata>): void {
    this.logger.debug(message, this.createLogMetadata(metadata));
  }

  http(message: string, request: Request, metadata?: Partial<LogMetadata>): void {
    this.logger.http(message, {
      ...this.createLogMetadata(metadata),
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.get("user-agent"),
    });
  }

  logAPIRequest(req: Request, metadata?: Partial<LogMetadata>): void {
    this.http(`API Request: ${req.method} ${req.url}`, req, {
      ...metadata,
      body: req.body,
      params: req.params,
      query: req.query,
    });
  }

  logPerformance(operation: string, startTime: number, metadata?: Partial<LogMetadata>): void {
    const duration = Date.now() - startTime;
    this.info(`Performance - ${operation} took ${duration}ms`, {
      ...metadata,
      duration,
      operation,
    });
  }
}

export const requestLogger = (req: Request, _: any, next: Function) => {
  const logger = new Logger("HTTP");
  logger.logAPIRequest(req);
  next();
};
