import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { PackmindLogger } from '@packmind/shared';

export interface ValidationErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  error: string;
  message: string;
  validationErrors: ValidationErrorDetail[];
  correlationId: string;
}

export interface ValidationErrorDetail {
  field: string;
  value: any;
  constraints: Record<string, string>;
}

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger: PackmindLogger;

  constructor() {
    this.logger = new PackmindLogger('ValidationExceptionFilter');
  }

  catch(exception: BadRequestException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status = exception.getStatus();
    const correlationId = this.generateCorrelationId();
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;

    const exceptionResponse = exception.getResponse() as any;

    // Check if this is a validation error from class-validator
    if (this.isValidationError(exceptionResponse)) {
      const validationErrors = this.formatValidationErrors(exceptionResponse.message);

      const errorResponse: ValidationErrorResponse = {
        statusCode: status,
        timestamp,
        path,
        method,
        error: 'Validation Failed',
        message: 'Request validation failed',
        validationErrors,
        correlationId,
      };

      this.logger.warn('Validation Error', {
        correlationId,
        path,
        method,
        validationErrors: validationErrors.map(err => ({
          field: err.field,
          constraints: Object.keys(err.constraints),
        })),
      });

      response.setHeader('X-Correlation-ID', correlationId);
      response.setHeader('X-Error-Timestamp', timestamp);
      response.status(status).json(errorResponse);
    } else {
      // Let other bad request exceptions pass through to global filter
      throw exception;
    }
  }

  private isValidationError(exceptionResponse: any): boolean {
    return (
      exceptionResponse &&
      Array.isArray(exceptionResponse.message) &&
      exceptionResponse.message.length > 0 &&
      typeof exceptionResponse.message[0] === 'object'
    );
  }

  private formatValidationErrors(validationErrors: any[]): ValidationErrorDetail[] {
    return validationErrors.map(error => ({
      field: error.property,
      value: error.value,
      constraints: error.constraints || {},
    }));
  }

  private generateCorrelationId(): string {
    return `val-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}