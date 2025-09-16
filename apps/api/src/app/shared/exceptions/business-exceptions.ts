import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base class for business logic exceptions
 */
export abstract class BusinessException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly code: string,
    public readonly details?: Record<string, any>
  ) {
    super(
      {
        message,
        error: code,
        details,
      },
      status
    );
  }
}

/**
 * Exception for resource not found errors
 */
export class ResourceNotFoundException extends BusinessException {
  constructor(resourceType: string, identifier: string | number, details?: Record<string, any>) {
    super(
      `${resourceType} with identifier '${identifier}' was not found`,
      HttpStatus.NOT_FOUND,
      'RESOURCE_NOT_FOUND',
      { resourceType, identifier, ...details }
    );
  }
}

/**
 * Exception for business rule violations
 */
export class BusinessRuleViolationException extends BusinessException {
  constructor(rule: string, message: string, details?: Record<string, any>) {
    super(
      message,
      HttpStatus.UNPROCESSABLE_ENTITY,
      'BUSINESS_RULE_VIOLATION',
      { rule, ...details }
    );
  }
}

/**
 * Exception for access denied errors
 */
export class AccessDeniedException extends BusinessException {
  constructor(resource: string, action: string, reason?: string, details?: Record<string, any>) {
    super(
      `Access denied: Cannot ${action} ${resource}${reason ? `. ${reason}` : ''}`,
      HttpStatus.FORBIDDEN,
      'ACCESS_DENIED',
      { resource, action, reason, ...details }
    );
  }
}

/**
 * Exception for conflict errors (e.g., duplicate resources)
 */
export class ConflictException extends BusinessException {
  constructor(message: string, conflictType: string, details?: Record<string, any>) {
    super(
      message,
      HttpStatus.CONFLICT,
      'RESOURCE_CONFLICT',
      { conflictType, ...details }
    );
  }
}

/**
 * Exception for rate limiting errors
 */
export class RateLimitExceededException extends BusinessException {
  constructor(limit: number, windowSeconds: number, details?: Record<string, any>) {
    super(
      `Rate limit exceeded: Maximum ${limit} requests per ${windowSeconds} seconds`,
      HttpStatus.TOO_MANY_REQUESTS,
      'RATE_LIMIT_EXCEEDED',
      { limit, windowSeconds, ...details }
    );
  }
}

/**
 * Exception for external service errors
 */
export class ExternalServiceException extends BusinessException {
  constructor(service: string, operation: string, reason?: string, details?: Record<string, any>) {
    super(
      `External service error: ${service} ${operation} failed${reason ? `: ${reason}` : ''}`,
      HttpStatus.BAD_GATEWAY,
      'EXTERNAL_SERVICE_ERROR',
      { service, operation, reason, ...details }
    );
  }
}