import { HttpStatus } from '@nestjs/common';
import { PackmindLogger } from '@packmind/shared';

export interface ErrorContext {
  correlationId?: string;
  userId?: string;
  organizationId?: string;
  resource?: string;
  action?: string;
  [key: string]: any;
}

export class ErrorResponseUtil {
  /**
   * Log an error with consistent format and context
   */
  static logError(
    logger: PackmindLogger,
    message: string,
    error: unknown,
    context: ErrorContext = {}
  ): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    logger.error(message, {
      error: errorMessage,
      stack,
      ...context,
    });
  }

  /**
   * Log a warning with consistent format and context
   */
  static logWarning(
    logger: PackmindLogger,
    message: string,
    context: ErrorContext = {}
  ): void {
    logger.warn(message, context);
  }

  /**
   * Log info with consistent format and context
   */
  static logInfo(
    logger: PackmindLogger,
    message: string,
    context: ErrorContext = {}
  ): void {
    logger.info(message, context);
  }

  /**
   * Determine if error should be logged as error (5xx) or warning (4xx)
   */
  static shouldLogAsError(statusCode: number): boolean {
    return statusCode >= HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Sanitize error details for production
   */
  static sanitizeErrorDetails(details: unknown): unknown {
    if (process.env.NODE_ENV === 'production') {
      // In production, only return safe details
      if (typeof details === 'object' && details !== null) {
        const safeDetails: Record<string, unknown> = {};
        const allowedKeys = ['code', 'type', 'resource', 'identifier'];

        for (const [key, value] of Object.entries(details)) {
          if (allowedKeys.includes(key)) {
            safeDetails[key] = value;
          }
        }

        return safeDetails;
      }
      return undefined;
    }

    return details;
  }

  /**
   * Create standard error context for requests
   */
  static createRequestContext(
    method: string,
    path: string,
    userId?: string,
    organizationId?: string
  ): ErrorContext {
    return {
      method,
      path,
      userId,
      organizationId,
      timestamp: new Date().toISOString(),
    };
  }
}