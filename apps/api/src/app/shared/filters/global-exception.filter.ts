import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { PackmindLogger } from '@packmind/shared';

export interface ApiErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
  details?: unknown;
  correlationId: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger: PackmindLogger;

  constructor() {
    this.logger = new PackmindLogger('GlobalExceptionFilter');
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const correlationId = this.generateCorrelationId();
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;

    let status: number;
    let message: string | string[];
    let error: string;
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        error = responseObj.error || exception.name;
        details = responseObj.details;
      } else {
        message = exception.message;
        error = exception.name;
      }

      // Log HTTP exceptions at appropriate level
      if (status >= 500) {
        this.logger.error('HTTP Server Error', {
          correlationId,
          status,
          error,
          message,
          path,
          method,
          stack: exception.stack,
          details,
        });
      } else if (status >= 400) {
        this.logger.warn('HTTP Client Error', {
          correlationId,
          status,
          error,
          message,
          path,
          method,
          details,
        });
      }
    } else if (exception instanceof Error) {
      // Handle non-HTTP errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'InternalServerError';

      this.logger.error('Unhandled Exception', {
        correlationId,
        error: exception.name,
        message: exception.message,
        path,
        method,
        stack: exception.stack,
      });
    } else {
      // Handle unknown exceptions
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'UnknownError';

      this.logger.error('Unknown Exception', {
        correlationId,
        exception: String(exception),
        path,
        method,
      });
    }

    const errorResponse: ApiErrorResponse = {
      statusCode: status,
      timestamp,
      path,
      method,
      message,
      error,
      correlationId,
    };

    // Only include details in non-production environments or for client errors
    if (process.env.NODE_ENV !== 'production' || status < 500) {
      if (details !== undefined) {
        errorResponse.details = details;
      }
    }

    // Set response headers for error tracking
    response.setHeader('X-Correlation-ID', correlationId);
    response.setHeader('X-Error-Timestamp', timestamp);

    response.status(status).json(errorResponse);
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}