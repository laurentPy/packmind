import { HttpStatus } from '@nestjs/common';
import {
  ResourceNotFoundException,
  BusinessRuleViolationException,
  AccessDeniedException,
  ConflictException,
  RateLimitExceededException,
  ExternalServiceException,
} from './business-exceptions';

describe('Business Exceptions', () => {
  describe('ResourceNotFoundException', () => {
    it('should create exception with correct message and details', () => {
      const exception = new ResourceNotFoundException('User', '123', { org: 'test' });

      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(exception.message).toBe("User with identifier '123' was not found");
      expect(exception.code).toBe('RESOURCE_NOT_FOUND');

      const response = exception.getResponse() as any;
      expect(response.details).toEqual({
        resourceType: 'User',
        identifier: '123',
        org: 'test',
      });
    });
  });

  describe('BusinessRuleViolationException', () => {
    it('should create exception with rule violation details', () => {
      const exception = new BusinessRuleViolationException(
        'max_recipes_per_user',
        'User has reached maximum recipe limit',
        { currentCount: 10, limit: 10 }
      );

      expect(exception.getStatus()).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(exception.message).toBe('User has reached maximum recipe limit');
      expect(exception.code).toBe('BUSINESS_RULE_VIOLATION');

      const response = exception.getResponse() as any;
      expect(response.details).toEqual({
        rule: 'max_recipes_per_user',
        currentCount: 10,
        limit: 10,
      });
    });
  });

  describe('AccessDeniedException', () => {
    it('should create exception with access details', () => {
      const exception = new AccessDeniedException(
        'Recipe',
        'delete',
        'Not the owner',
        { ownerId: '456', requesterId: '123' }
      );

      expect(exception.getStatus()).toBe(HttpStatus.FORBIDDEN);
      expect(exception.message).toBe('Access denied: Cannot delete Recipe. Not the owner');
      expect(exception.code).toBe('ACCESS_DENIED');

      const response = exception.getResponse() as any;
      expect(response.details).toEqual({
        resource: 'Recipe',
        action: 'delete',
        reason: 'Not the owner',
        ownerId: '456',
        requesterId: '123',
      });
    });

    it('should create exception without reason', () => {
      const exception = new AccessDeniedException('Organization', 'view');

      expect(exception.message).toBe('Access denied: Cannot view Organization');

      const response = exception.getResponse() as any;
      expect(response.details.reason).toBeUndefined();
    });
  });

  describe('ConflictException', () => {
    it('should create conflict exception', () => {
      const exception = new ConflictException(
        'Username already exists',
        'duplicate_username',
        { username: 'testuser' }
      );

      expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
      expect(exception.message).toBe('Username already exists');
      expect(exception.code).toBe('RESOURCE_CONFLICT');

      const response = exception.getResponse() as any;
      expect(response.details).toEqual({
        conflictType: 'duplicate_username',
        username: 'testuser',
      });
    });
  });

  describe('RateLimitExceededException', () => {
    it('should create rate limit exception', () => {
      const exception = new RateLimitExceededException(100, 3600, { userId: '123' });

      expect(exception.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(exception.message).toBe('Rate limit exceeded: Maximum 100 requests per 3600 seconds');
      expect(exception.code).toBe('RATE_LIMIT_EXCEEDED');

      const response = exception.getResponse() as any;
      expect(response.details).toEqual({
        limit: 100,
        windowSeconds: 3600,
        userId: '123',
      });
    });
  });

  describe('ExternalServiceException', () => {
    it('should create external service exception', () => {
      const exception = new ExternalServiceException(
        'GitHub',
        'fetch repositories',
        'API timeout',
        { timeout: 30000 }
      );

      expect(exception.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
      expect(exception.message).toBe('External service error: GitHub fetch repositories failed: API timeout');
      expect(exception.code).toBe('EXTERNAL_SERVICE_ERROR');

      const response = exception.getResponse() as any;
      expect(response.details).toEqual({
        service: 'GitHub',
        operation: 'fetch repositories',
        reason: 'API timeout',
        timeout: 30000,
      });
    });

    it('should create external service exception without reason', () => {
      const exception = new ExternalServiceException('Slack', 'send notification');

      expect(exception.message).toBe('External service error: Slack send notification failed');

      const response = exception.getResponse() as any;
      expect(response.details.reason).toBeUndefined();
    });
  });
});