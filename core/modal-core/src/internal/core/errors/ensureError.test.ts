/**
 * Tests for ensureError utilities
 * @module ensureError.test
 */

import { describe, it, expect } from 'vitest';
import { ErrorFactory } from './errorFactory.js';
import { ensureError, ensureModalError } from './ensureError.js';
import { ERROR_CODES } from './types.js';

describe('ensureError', () => {
  describe('Error conversion', () => {
    it('should return Error instances as-is', () => {
      const originalError = new Error('Original message');
      const result = ensureError(originalError);

      expect(result).toBe(originalError);
      expect(result.message).toBe('Original message');
      expect(result.stack).toBeDefined();
    });

    it('should convert string to Error with message', () => {
      const result = ensureError('string error');

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('string error');
      expect(result.stack).toBeDefined();
    });

    it('should convert object with message property', () => {
      const errorObj = { message: 'Custom error', code: 500 };
      const result = ensureError(errorObj);

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Custom error');
      expect(result.cause).toBe(errorObj);
      expect(result.stack).toBeDefined();
    });

    it('should convert object without message property', () => {
      const errorObj = { code: 500, details: 'Something went wrong' };
      const result = ensureError(errorObj);

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('[object Object]');
      expect(result.cause).toBe(errorObj);
      expect(result.stack).toBeDefined();
    });

    it('should convert null to Error', () => {
      const result = ensureError(null);

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('null');
      expect(result.cause).toBe(null);
    });

    it('should convert undefined to Error', () => {
      const result = ensureError(undefined);

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('undefined');
      expect(result.cause).toBe(undefined);
    });

    it('should convert number to Error', () => {
      const result = ensureError(404);

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('404');
      expect(result.cause).toBe(404);
    });

    it('should convert boolean to Error', () => {
      const result = ensureError(false);

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('false');
      expect(result.cause).toBe(false);
    });
  });

  describe('Stack trace preservation', () => {
    it('should preserve original Error stack trace', () => {
      const originalError = new Error('Original');
      const originalStack = originalError.stack;

      const result = ensureError(originalError);

      expect(result.stack).toBe(originalStack);
    });

    it('should create new stack trace for non-Error values', () => {
      const result = ensureError('string error');

      expect(result.stack).toBeDefined();
      expect(result.stack).toContain('ensureError.test');
    });

    it('should preserve cause for non-Error objects', () => {
      const errorObj = { message: 'Custom', extra: 'data' };
      const result = ensureError(errorObj);

      expect(result.cause).toBe(errorObj);
      expect((result.cause as Record<string, unknown>).extra).toBe('data');
    });
  });
});

describe('ensureModalError', () => {
  describe('ModalError conversion', () => {
    it('should return ModalError instances as-is', () => {
      const originalError = ErrorFactory.connectionFailed('Connection failed');
      const result = ensureModalError(originalError);

      expect(result).toBe(originalError);
      expect(result.code).toBe(ERROR_CODES.CONNECTION_FAILED);
      expect(result.category).toBe('network');
    });

    it('should add context to existing ModalError', () => {
      const originalError = ErrorFactory.connectionFailed('Connection failed');
      const result = ensureModalError(originalError, {
        component: 'TestComponent',
        operation: 'connect',
      });

      expect(result.code).toBe(ERROR_CODES.CONNECTION_FAILED);
      expect(result.data).toMatchObject({
        component: 'TestComponent',
        operation: 'connect',
      });
    });

    it('should convert Error to ModalError', () => {
      const originalError = new Error('Test error');
      const result = ensureModalError(originalError);

      expect(ErrorFactory.isModalError(result)).toBe(true);
      expect(result.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
      expect(result.message).toBe('Test error');
      expect(result.category).toBe('general');
      expect(result.cause).toBe(originalError);
    });

    it('should convert Error to ModalError with context', () => {
      const originalError = new Error('Test error');
      const result = ensureModalError(originalError, {
        component: 'WalletConnector',
        operation: 'connect',
        walletId: 'metamask',
      });

      expect(ErrorFactory.isModalError(result)).toBe(true);
      expect(result.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
      expect(result.cause).toBe(originalError);
      expect(result.data).toMatchObject({
        component: 'WalletConnector',
        operation: 'connect',
        walletId: 'metamask',
      });
    });

    it('should convert string to ModalError', () => {
      const result = ensureModalError('string error');

      expect(ErrorFactory.isModalError(result)).toBe(true);
      expect(result.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
      expect(result.message).toBe('string error');
      expect(result.category).toBe('general');
    });

    it('should convert string to ModalError with context', () => {
      const result = ensureModalError('string error', {
        component: 'TestComponent',
      });

      expect(ErrorFactory.isModalError(result)).toBe(true);
      expect(result.data).toMatchObject({
        component: 'TestComponent',
      });
    });

    it('should convert object to ModalError', () => {
      const errorObj = { message: 'Custom error', code: 500 };
      const result = ensureModalError(errorObj);

      expect(ErrorFactory.isModalError(result)).toBe(true);
      expect(result.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
      expect(result.message).toBe('Custom error');
      expect(result.cause).toBeInstanceOf(Error);
    });
  });

  describe('Stack trace preservation', () => {
    it('should preserve Error stack trace in cause', () => {
      const originalError = new Error('Original');
      const result = ensureModalError(originalError);

      expect(result.cause).toBe(originalError);
      expect((result.cause as Error).stack).toBeDefined();
    });

    it('should create Error with stack trace for strings', () => {
      const result = ensureModalError('string error');

      expect(result.cause).toBeInstanceOf(Error);
      expect((result.cause as Error).stack).toBeDefined();
    });

    it('should preserve context with cause', () => {
      const originalError = new Error('Original');
      const result = ensureModalError(originalError, {
        component: 'TestComponent',
        operation: 'testOp',
      });

      expect(result.cause).toBe(originalError);
      expect(result.data).toMatchObject({
        component: 'TestComponent',
        operation: 'testOp',
      });
    });
  });

  describe('Integration with ErrorFactory', () => {
    it('should recognize ensured errors as ModalErrors', () => {
      const result = ensureModalError('test');

      expect(ErrorFactory.isModalError(result)).toBe(true);
    });

    it('should work with existing ModalErrors from ErrorFactory', () => {
      const factoryError = ErrorFactory.connectionFailed('Failed');
      const result = ensureModalError(factoryError);

      expect(result).toBe(factoryError);
    });

    it('should preserve recovery strategy from factory errors', () => {
      const factoryError = ErrorFactory.connectionFailed('Failed');
      const result = ensureModalError(factoryError, {
        component: 'Test',
      });

      expect(result.recoveryStrategy).toBe('wait_and_retry');
      expect(result.retryDelay).toBe(2000);
      expect(result.maxRetries).toBe(5);
    });
  });

  describe('Edge cases', () => {
    it('should handle null', () => {
      const result = ensureModalError(null);

      expect(ErrorFactory.isModalError(result)).toBe(true);
      expect(result.message).toBe('null');
    });

    it('should handle undefined', () => {
      const result = ensureModalError(undefined);

      expect(ErrorFactory.isModalError(result)).toBe(true);
      expect(result.message).toBe('undefined');
    });

    it('should handle circular references in objects', () => {
      const circular: Record<string, unknown> = { message: 'test' };
      circular['self'] = circular;

      const result = ensureModalError(circular);

      expect(ErrorFactory.isModalError(result)).toBe(true);
      expect(result.message).toBe('test');
    });

    it('should handle context without overwriting existing data', () => {
      const error = ErrorFactory.connectionFailed('Failed', { attempt: 1 });
      const result = ensureModalError(error, { component: 'Test' });

      expect(result.data).toMatchObject({
        attempt: 1,
        component: 'Test',
      });
    });
  });
});