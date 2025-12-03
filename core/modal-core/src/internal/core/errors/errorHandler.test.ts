/**
 * Tests for simplified ErrorHandler
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createMockLogger, createTestEnvironment, installCustomMatchers } from '../../../testing/index.js';
import type { Logger } from '../logger/logger.js';
import { ErrorHandler } from './errorHandler.js';
import { ERROR_CODES } from './types.js';
import { isFatalError } from './utils.js';

// Install custom matchers
installCustomMatchers();

describe('ErrorHandler', () => {
  const testEnv = createTestEnvironment();
  let errorHandler: ErrorHandler;
  let mockLogger: Logger;

  beforeEach(async () => {
    await testEnv.setup();
    mockLogger = createMockLogger();

    errorHandler = new ErrorHandler(mockLogger);
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('error handling', () => {
    it('should handle Error objects', () => {
      const error = new Error('Test error message');
      const result = errorHandler.handleError(error);

      expect(result.code).toBe('unknown_error');
      expect(result.message).toBe('An unexpected error occurred');
      expect(result.category).toBe('general');
      expect(result.fatal).toBeUndefined();
      // Since the test ErrorFactory doesn't return ModalErrorImpl instances,
      // the result has no recoveryStrategy, making it fatal
      expect(isFatalError(result)).toBe(true);
    });

    it('should handle string errors', () => {
      const result = errorHandler.handleError('String error');

      expect(result.code).toBe('unknown_error');
      expect(result.message).toBe('An unexpected error occurred');
      expect(result.category).toBe('general');
    });

    it('should pass through existing modal errors', () => {
      const modalError = {
        code: 'existing_error',
        message: 'Existing error',
        category: 'network' as const,
        fatal: undefined,
      };

      const result = errorHandler.handleError(modalError);
      expect(result.code).toBe('existing_error');
      expect(result.message).toBe('Existing error');
      expect(result.category).toBe('network');
      expect(result.fatal).toBeUndefined();
      // Since the test ErrorFactory doesn't return ModalErrorImpl instances,
      // the result has no recoveryStrategy, making it fatal
      expect(isFatalError(result)).toBe(true);
    });
  });

  describe('getUserMessage', () => {
    it('should return user-friendly message', () => {
      const error = new Error('Complex technical error');
      const message = errorHandler.getUserMessage(error);

      expect(message).toBe('An unexpected error occurred');
    });
  });

  describe('isFatal', () => {
    it('should identify fatal errors', () => {
      const error = new Error('User rejected');
      const fatal = errorHandler.isFatal(error);

      // User rejection is fatal (recoveryStrategy: 'none')
      expect(fatal).toBe(true);
    });

    it('should identify non-fatal errors', () => {
      const error = new Error('Network timeout');
      const fatal = errorHandler.isFatal(error);

      // Network errors should be recoverable (not fatal)
      expect(fatal).toBe(false);
    });

    it('should match isFatalError utility function', () => {
      const errors = [
        new Error('User rejected'),
        new Error('Network timeout'),
        new Error('Wallet not found'),
        new Error('Unknown error'),
      ];

      for (const error of errors) {
        const handlerResult = errorHandler.isFatal(error);
        const utilityResult = isFatalError(errorHandler.handleError(error));
        expect(handlerResult).toBe(utilityResult);
      }
    });
  });

  describe('handleError', () => {
    it('should handle generic errors', () => {
      const error = errorHandler.handleError(new Error('Test message'));

      expect(error.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
      expect(error.message).toBe('An unexpected error occurred');
      expect(error.category).toBe('general');
      // Unknown errors have recoveryStrategy: 'none', making them fatal
      expect(error.recoveryStrategy).toBe('none');
      expect(isFatalError(error)).toBe(true);
    });

    it('should handle errors with context', () => {
      const error = errorHandler.handleError(new Error('Test message'), { walletId: 'test' });

      expect(error.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
      expect(error.data).toEqual({ walletId: 'test' });
    });

    it('should detect user rejection patterns', () => {
      const error = errorHandler.handleError(new Error('User rejected the request'));

      expect(error.code).toBe(ERROR_CODES.USER_REJECTED);
      expect(error.category).toBe('user');
      // In test environment, ErrorFactory returns plain objects without recoveryStrategy
      // User rejection is fatal (would have recoveryStrategy: 'none' in production)
      expect(isFatalError(error)).toBe(true);
    });
  });

  describe('logError', () => {
    it('should log errors with context', () => {
      const error = new Error('Test error');
      errorHandler.logError(error, 'test_context');

      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
