/**
 * Edge case tests for utils.ts to improve coverage
 * Tests missing lines in error utility functions
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestEnvironment, installCustomMatchers } from '../../../testing/index.js';
import type { ModalError } from './types.js';
import { ERROR_CODES } from './types.js';
import { isFatalError, isModalError, markAsFatal } from './utils.js';

// Install custom matchers
installCustomMatchers();

describe('Error Utils - Edge Cases', () => {
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });
  describe('isModalError', () => {
    it('should return true for valid ModalError objects', () => {
      const validModalError = {
        code: ERROR_CODES.USER_REJECTED,
        message: 'User cancelled',
        category: 'user' as const,
      };

      expect(isModalError(validModalError)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isModalError(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isModalError(undefined)).toBe(false);
    });

    it('should return false for non-objects', () => {
      expect(isModalError('string')).toBe(false);
      expect(isModalError(123)).toBe(false);
      expect(isModalError(true)).toBe(false);
    });

    it('should return false for objects missing required properties', () => {
      expect(isModalError({ code: 'test' })).toBe(false); // Missing message and category
      expect(isModalError({ message: 'test' })).toBe(false); // Missing code and category
      expect(isModalError({ category: 'user' })).toBe(false); // Missing code and message
      expect(isModalError({ code: 'test', message: 'test' })).toBe(false); // Missing category
      expect(isModalError({ code: 'test', category: 'user' })).toBe(false); // Missing message
      expect(isModalError({ message: 'test', category: 'user' })).toBe(false); // Missing code
    });

    it('should return true for objects with all required properties plus extras', () => {
      const errorWithExtras = {
        code: ERROR_CODES.NETWORK_ERROR,
        message: 'Network error',
        category: 'network' as const,
        fatal: true,
        data: { extra: 'data' },
        timestamp: Date.now(),
      };

      expect(isModalError(errorWithExtras)).toBe(true);
    });
  });

  describe('isFatalError', () => {
    it('should return true for errors with explicit fatal=true', () => {
      const fatalError = {
        code: ERROR_CODES.NETWORK_ERROR,
        message: 'Fatal network error',
        category: 'network' as const,
        recoveryStrategy: 'none' as const, // Fatal means not recoverable
      };

      expect(isFatalError(fatalError)).toBe(true);
    });

    it('should return false for errors with explicit fatal=false', () => {
      const nonFatalError = {
        code: ERROR_CODES.NETWORK_ERROR,
        message: 'Recoverable network error',
        category: 'network' as const,
        recoveryStrategy: 'retry' as const, // Recoverable
      };

      expect(isFatalError(nonFatalError)).toBe(false);
    });

    it('should return true for network category errors without recoveryStrategy', () => {
      const networkError = {
        code: ERROR_CODES.NETWORK_ERROR,
        message: 'Network error',
        category: 'network' as const,
        // No recoveryStrategy means fatal
      };

      expect(isFatalError(networkError)).toBe(true);
    });

    it('should return true for general category errors without recoveryStrategy', () => {
      const generalError = {
        code: ERROR_CODES.UNKNOWN_ERROR,
        message: 'Unknown error',
        category: 'general' as const,
        // No recoveryStrategy means fatal
      };

      expect(isFatalError(generalError)).toBe(true);
    });

    it('should return false for regular Error objects', () => {
      const regularError = new Error('Regular error');
      expect(isFatalError(regularError)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isFatalError(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isFatalError(undefined)).toBe(false);
    });

    it('should return false for non-object types', () => {
      expect(isFatalError('string')).toBe(false);
      expect(isFatalError(123)).toBe(false);
      expect(isFatalError(true)).toBe(false);
    });

    it('should return false for objects without category or isRecoverable properties', () => {
      const basicObject = { message: 'Some message' };
      expect(isFatalError(basicObject)).toBe(false);
    });

    it('should handle recoveryStrategy values correctly', () => {
      const notRecoverable = {
        code: 'test',
        message: 'test',
        category: 'general' as const,
        recoveryStrategy: 'none' as const, // Explicitly not recoverable (fatal)
      };

      const recoverable = {
        code: 'test',
        message: 'test',
        category: 'general' as const,
        recoveryStrategy: 'retry' as const, // Explicitly recoverable (not fatal)
      };

      expect(isFatalError(notRecoverable)).toBe(true);
      expect(isFatalError(recoverable)).toBe(false);
    });
  });

  describe('markAsFatal', () => {
    it('should add fatal flag to error without modifying original', () => {
      const originalError: ModalError = {
        code: ERROR_CODES.NETWORK_ERROR,
        message: 'Network error',
        category: 'network',
      };

      const fatalError = markAsFatal(originalError);

      expect(fatalError.recoveryStrategy).toBe('none'); // Fatal means not recoverable
      expect(originalError.recoveryStrategy).toBeUndefined(); // Original unchanged
      expect(fatalError).not.toBe(originalError); // Different object
    });

    it('should preserve all other properties', () => {
      const originalError: ModalError = {
        code: ERROR_CODES.CONNECTION_FAILED,
        message: 'Connection failed',
        category: 'network',
        data: { attempt: 3, endpoint: 'api.example.com' },
      };

      const fatalError = markAsFatal(originalError);

      expect(fatalError.code).toBe(originalError.code);
      expect(fatalError.message).toBe(originalError.message);
      expect(fatalError.category).toBe(originalError.category);
      expect(fatalError.data).toEqual(originalError.data);
      expect(fatalError.recoveryStrategy).toBe('none'); // Fatal means not recoverable
    });

    it('should override existing isRecoverable flag', () => {
      const originalError: ModalError = {
        code: ERROR_CODES.NETWORK_ERROR,
        message: 'Network error',
        category: 'network',
        recoveryStrategy: 'retry' as const, // Originally recoverable
      };

      const fatalError = markAsFatal(originalError);

      expect(fatalError.recoveryStrategy).toBe('none'); // Now fatal (not recoverable)
      expect(originalError.recoveryStrategy).toBe('retry'); // Original unchanged
    });
  });

  describe('Integration between utility functions', () => {
    it('should work together for fatal marking', () => {
      const originalError: ModalError = {
        code: ERROR_CODES.NETWORK_ERROR,
        message: 'Network error',
        category: 'network',
      };

      // Initially fatal (no recoveryStrategy)
      expect(isFatalError(originalError)).toBe(true);

      // Mark as fatal
      const fatalError = markAsFatal(originalError);
      expect(isFatalError(fatalError)).toBe(true);

      // Create non-fatal version by adding recoveryStrategy
      const nonFatalError = { ...originalError, recoveryStrategy: 'retry' as const };
      expect(isFatalError(nonFatalError)).toBe(false);
    });

    it('should handle complex error objects', () => {
      const complexError: ModalError = {
        code: 'CUSTOM_ERROR',
        message: 'Complex error with extra data',
        category: 'general',
        data: {
          timestamp: Date.now(),
          context: { operation: 'test', attempt: 3 },
          metadata: { source: 'test', version: '1.0.0' },
        },
      };

      expect(isModalError(complexError)).toBe(true);
      expect(isFatalError(complexError)).toBe(true); // No recoveryStrategy means fatal

      const fatalVersion = markAsFatal(complexError);
      expect(isFatalError(fatalVersion)).toBe(true);
      expect(fatalVersion.data).toEqual(complexError.data);
    });
  });
});
