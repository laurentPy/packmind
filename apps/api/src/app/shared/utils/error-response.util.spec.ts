import { HttpStatus } from '@nestjs/common';
import { PackmindLogger } from '@packmind/shared';
import { ErrorResponseUtil } from './error-response.util';

// Mock PackmindLogger
jest.mock('@packmind/shared', () => ({
  PackmindLogger: jest.fn().mockImplementation(() => ({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  })),
}));

describe('ErrorResponseUtil', () => {
  let mockLogger: jest.Mocked<PackmindLogger>;

  beforeEach(() => {
    mockLogger = new PackmindLogger('test') as jest.Mocked<PackmindLogger>;
  });

  describe('logError', () => {
    it('should log error with context', () => {
      const error = new Error('Test error');
      const context = { userId: '123', resource: 'User' };

      ErrorResponseUtil.logError(mockLogger, 'Test message', error, context);

      expect(mockLogger.error).toHaveBeenCalledWith('Test message', {
        error: 'Test error',
        stack: error.stack,
        userId: '123',
        resource: 'User',
      });
    });

    it('should handle non-Error objects', () => {
      const error = 'String error';

      ErrorResponseUtil.logError(mockLogger, 'Test message', error);

      expect(mockLogger.error).toHaveBeenCalledWith('Test message', {
        error: 'String error',
        stack: undefined,
      });
    });
  });

  describe('shouldLogAsError', () => {
    it('should return true for 5xx status codes', () => {
      expect(ErrorResponseUtil.shouldLogAsError(500)).toBe(true);
      expect(ErrorResponseUtil.shouldLogAsError(502)).toBe(true);
      expect(ErrorResponseUtil.shouldLogAsError(503)).toBe(true);
    });

    it('should return false for 4xx status codes', () => {
      expect(ErrorResponseUtil.shouldLogAsError(400)).toBe(false);
      expect(ErrorResponseUtil.shouldLogAsError(404)).toBe(false);
      expect(ErrorResponseUtil.shouldLogAsError(422)).toBe(false);
    });

    it('should return false for 2xx and 3xx status codes', () => {
      expect(ErrorResponseUtil.shouldLogAsError(200)).toBe(false);
      expect(ErrorResponseUtil.shouldLogAsError(301)).toBe(false);
    });
  });

  describe('sanitizeErrorDetails', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should return full details in non-production', () => {
      process.env.NODE_ENV = 'development';
      const details = { code: 'TEST', sensitive: 'secret', public: 'info' };

      const result = ErrorResponseUtil.sanitizeErrorDetails(details);

      expect(result).toEqual(details);
    });

    it('should filter details in production', () => {
      process.env.NODE_ENV = 'production';
      const details = {
        code: 'TEST',
        type: 'validation',
        resource: 'User',
        identifier: '123',
        sensitive: 'secret',
        password: 'hidden'
      };

      const result = ErrorResponseUtil.sanitizeErrorDetails(details);

      expect(result).toEqual({
        code: 'TEST',
        type: 'validation',
        resource: 'User',
        identifier: '123',
      });
    });

    it('should return undefined for non-objects in production', () => {
      process.env.NODE_ENV = 'production';

      expect(ErrorResponseUtil.sanitizeErrorDetails('string')).toBeUndefined();
      expect(ErrorResponseUtil.sanitizeErrorDetails(123)).toBeUndefined();
      expect(ErrorResponseUtil.sanitizeErrorDetails(null)).toBeUndefined();
    });
  });

  describe('createRequestContext', () => {
    it('should create context with all parameters', () => {
      const context = ErrorResponseUtil.createRequestContext(
        'POST',
        '/api/users',
        '123',
        '456'
      );

      expect(context).toEqual({
        method: 'POST',
        path: '/api/users',
        userId: '123',
        organizationId: '456',
        timestamp: expect.any(String),
      });

      expect(new Date(context.timestamp!)).toBeInstanceOf(Date);
    });

    it('should create context with minimal parameters', () => {
      const context = ErrorResponseUtil.createRequestContext('GET', '/api/health');

      expect(context).toEqual({
        method: 'GET',
        path: '/api/health',
        userId: undefined,
        organizationId: undefined,
        timestamp: expect.any(String),
      });
    });
  });
});