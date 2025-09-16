import { GlobalExceptionFilter, ApiErrorResponse } from './global-exception.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockRequest: any;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      url: '/api/test',
      method: 'POST',
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;
  });

  it('should handle HttpException correctly', () => {
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Test error',
        error: 'HttpException',
        path: '/api/test',
        method: 'POST',
      })
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Correlation-ID', expect.any(String));
  });

  it('should handle complex HttpException responses', () => {
    const exceptionResponse = {
      message: ['field1 is required', 'field2 must be a string'],
      error: 'ValidationError',
      details: { field1: 'missing', field2: 'invalid' }
    };
    const exception = new HttpException(exceptionResponse, HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: ['field1 is required', 'field2 must be a string'],
        error: 'ValidationError',
        details: { field1: 'missing', field2: 'invalid' },
      })
    );
  });

  it('should handle generic Error instances', () => {
    const exception = new Error('Database connection failed');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
        error: 'InternalServerError',
      })
    );
  });

  it('should handle unknown exceptions', () => {
    const exception = 'Unknown error string';

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
        error: 'UnknownError',
      })
    );
  });

  it('should include correlation ID and timestamp', () => {
    const exception = new HttpException('Test', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost);

    const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0] as ApiErrorResponse;

    expect(responseCall.correlationId).toBeDefined();
    expect(responseCall.timestamp).toBeDefined();
    expect(new Date(responseCall.timestamp)).toBeInstanceOf(Date);
  });

  it('should set response headers for error tracking', () => {
    const exception = new HttpException('Test', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost);

    expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Correlation-ID', expect.any(String));
    expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Error-Timestamp', expect.any(String));
  });
});