/**
 * Edge case tests for ErrorHandler to improve coverage
 * Tests missing patterns, logging scenarios, and error creation methods
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockLogger, createTestEnvironment, installCustomMatchers } from '../../../testing/index.js';
import type { Logger } from '../logger/logger.js';
import { ErrorHandler } from './errorHandler.js';
import { ERROR_CODES } from './types.js';

// Install custom matchers
installCustomMatchers();

describe('ErrorHandler - Edge Cases', () => {
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

  describe('Pattern Recognition Edge Cases', () => {
    describe('User Rejection Patterns', () => {
      it('should detect "user denied" pattern', () => {
        const error = new Error('User denied the transaction');
        const result = errorHandler.handleError(error);

        expect(result.code).toBe(ERROR_CODES.USER_REJECTED);
        expect(result.message).toBe('User cancelled the operation');
        expect(result.category).toBe('user');
        expect(result.isRecoverable).toBeUndefined();
      });

      it('should detect "cancelled" pattern', () => {
        const error = new Error('Request was cancelled');
        const result = errorHandler.handleError(error);

        expect(result.code).toBe(ERROR_CODES.USER_REJECTED);
        expect(result.category).toBe('user');
        expect(result.isRecoverable).toBeUndefined();
      });

      it('should detect "user cancelled" pattern', () => {
        const error = new Error('User cancelled the operation');
        const result = errorHandler.handleError(error);

        expect(result.code).toBe(ERROR_CODES.USER_REJECTED);
        expect(result.category).toBe('user');
        expect(result.isRecoverable).toBeUndefined();
      });

      it('should detect "rejected by user" pattern', () => {
        const error = new Error('Transaction rejected by user');
        const result = errorHandler.handleError(error);

        expect(result.code).toBe(ERROR_CODES.USER_REJECTED);
        expect(result.category).toBe('user');
        expect(result.isRecoverable).toBeUndefined();
      });

      it('should detect "denied by user" pattern', () => {
        const error = new Error('Request denied by user');
        const result = errorHandler.handleError(error);

        expect(result.code).toBe(ERROR_CODES.USER_REJECTED);
        expect(result.category).toBe('user');
        expect(result.isRecoverable).toBeUndefined();
      });

      it('should detect "user declined" pattern', () => {
        const error = new Error('User declined the permission request');
        const result = errorHandler.handleError(error);

        expect(result.code).toBe(ERROR_CODES.USER_REJECTED);
        expect(result.category).toBe('user');
        expect(result.isRecoverable).toBeUndefined();
      });

      it('should handle user rejection with context', () => {
        const error = new Error('User rejected the transaction');
        const context = { operation: 'sign', walletId: 'metamask' };
        const result = errorHandler.handleError(error, context);

        expect(result.code).toBe(ERROR_CODES.USER_REJECTED);
        expect(result.data).toEqual(context);
      });
    });

    describe('Wallet Not Found Patterns', () => {
      it('should detect "not found" pattern', () => {
        const error = new Error('Wallet not found');
        const result = errorHandler.handleError(error);

        expect(result.code).toBe(ERROR_CODES.WALLET_NOT_FOUND);
        expect(result.message).toBe('Wallet not found');
        expect(result.category).toBe('wallet');
        expect(result.isRecoverable).toBeUndefined();
      });

      it('should detect "not installed" pattern', () => {
        const error = new Error('MetaMask not installed');
        const result = errorHandler.handleError(error);

        expect(result.code).toBe(ERROR_CODES.WALLET_NOT_FOUND);
        expect(result.category).toBe('wallet');
        expect(result.isRecoverable).toBeUndefined();
      });

      it('should detect "not detected" pattern', () => {
        const error = new Error('Wallet not detected');
        const result = errorHandler.handleError(error);

        expect(result.code).toBe(ERROR_CODES.WALLET_NOT_FOUND);
        expect(result.category).toBe('wallet');
        expect(result.isRecoverable).toBeUndefined();
      });

      it('should detect "not available" pattern', () => {
        const error = new Error('Provider not available');
        const result = errorHandler.handleError(error);

        expect(result.code).toBe(ERROR_CODES.WALLET_NOT_FOUND);
        expect(result.category).toBe('wallet');
        expect(result.isRecoverable).toBeUndefined();
      });

      it('should detect "wallet not found" pattern', () => {
        const error = new Error('Ethereum wallet not found');
        const result = errorHandler.handleError(error);

        expect(result.code).toBe(ERROR_CODES.WALLET_NOT_FOUND);
        expect(result.category).toBe('wallet');
        expect(result.isRecoverable).toBeUndefined();
      });

      it('should detect "metamask not found" pattern', () => {
        const error = new Error('MetaMask not found');
        const result = errorHandler.handleError(error);

        expect(result.code).toBe(ERROR_CODES.WALLET_NOT_FOUND);
        expect(result.category).toBe('wallet');
        expect(result.isRecoverable).toBeUndefined();
      });

      it('should detect "not connected" pattern', () => {
        const error = new Error('Wallet not connected');
        const result = errorHandler.handleError(error);

        expect(result.code).toBe(ERROR_CODES.WALLET_NOT_FOUND);
        expect(result.category).toBe('wallet');
        expect(result.isRecoverable).toBeUndefined();
      });

      it('should handle wallet not found with context', () => {
        const error = new Error('MetaMask not found');
        const context = { walletId: 'metamask', operation: 'connect' };
        const result = errorHandler.handleError(error, context);

        expect(result.code).toBe(ERROR_CODES.WALLET_NOT_FOUND);
        expect(result.data).toEqual(context);
      });
    });

    describe('Network Error Patterns', () => {
      it('should detect "network" pattern', () => {
        const error = new Error('Network error occurred');
        const result = errorHandler.handleError(error);

        expect(result.code).toBe(ERROR_CODES.NETWORK_ERROR);
        expect(result.message).toBe('Connection failed. Please try again.');
        expect(result.category).toBe('network');
        expect(result.isRecoverable).toBeUndefined();
      });

      it('should detect "timeout" pattern', () => {
        const error = new Error('Request timeout');
        const result = errorHandler.handleError(error);

        expect(result.code).toBe(ERROR_CODES.NETWORK_ERROR);
        expect(result.category).toBe('network');
        expect(result.isRecoverable).toBeUndefined();
      });

      it('should detect "connection failed" pattern', () => {
        const error = new Error('Connection failed to server');
        const result = errorHandler.handleError(error);

        expect(result.code).toBe(ERROR_CODES.NETWORK_ERROR);
        expect(result.category).toBe('network');
        expect(result.isRecoverable).toBeUndefined();
      });

      it('should detect "fetch failed" pattern', () => {
        const error = new Error('Fetch failed for unknown reason');
        const result = errorHandler.handleError(error);

        expect(result.code).toBe(ERROR_CODES.NETWORK_ERROR);
        expect(result.category).toBe('network');
        expect(result.isRecoverable).toBeUndefined();
      });

      it('should detect "request failed" pattern', () => {
        const error = new Error('HTTP request failed');
        const result = errorHandler.handleError(error);

        expect(result.code).toBe(ERROR_CODES.NETWORK_ERROR);
        expect(result.category).toBe('network');
        expect(result.isRecoverable).toBeUndefined();
      });

      it('should detect "unable to connect" pattern', () => {
        const error = new Error('Unable to connect to network');
        const result = errorHandler.handleError(error);

        expect(result.code).toBe(ERROR_CODES.NETWORK_ERROR);
        expect(result.category).toBe('network');
        expect(result.isRecoverable).toBeUndefined();
      });

      it('should detect "connectivity" pattern', () => {
        const error = new Error('Connectivity issues detected');
        const result = errorHandler.handleError(error);

        expect(result.code).toBe(ERROR_CODES.NETWORK_ERROR);
        expect(result.category).toBe('network');
        expect(result.isRecoverable).toBeUndefined();
      });

      it('should handle network error with context', () => {
        const error = new Error('Network timeout occurred');
        const context = { operation: 'send', attempt: 3 };
        const result = errorHandler.handleError(error, context);

        expect(result.code).toBe(ERROR_CODES.NETWORK_ERROR);
        expect(result.data).toEqual(context);
      });
    });
  });

  describe('Logging Edge Cases', () => {
    it('should log user errors as debug messages', () => {
      const error = new Error('User rejected the request');
      errorHandler.logError(error, 'connect_wallet');

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'User action:',
        expect.objectContaining({
          code: ERROR_CODES.USER_REJECTED,
          category: 'user',
          operation: 'connect_wallet',
        }),
      );
    });

    it('should log non-fatal network errors as info messages', () => {
      const error = new Error('Network timeout');
      errorHandler.logError(error, 'fetch_data');

      // Network errors now properly have recovery strategies, so they're recoverable
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Recoverable network error:',
        expect.objectContaining({
          code: 'network_error',
          category: 'network',
          operation: 'fetch_data',
        }),
      );
    });

    it('should log fatal network errors as warn messages', () => {
      const fatalNetworkError = {
        code: ERROR_CODES.NETWORK_ERROR,
        message: 'Fatal network issue',
        category: 'network' as const,
        recoveryStrategy: 'none' as const,
      };
      errorHandler.logError(fatalNetworkError, 'critical_operation');

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Non-recoverable network error:',
        expect.objectContaining({
          code: ERROR_CODES.NETWORK_ERROR,
          category: 'network',
          operation: 'critical_operation',
        }),
      );
    });

    it('should log wallet errors as warn messages', () => {
      const error = new Error('Wallet not found');
      errorHandler.logError(error, 'wallet_detection');

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Wallet error:',
        expect.objectContaining({
          code: ERROR_CODES.WALLET_NOT_FOUND,
          category: 'wallet',
          operation: 'wallet_detection',
        }),
      );
    });

    it('should log unknown category errors as error messages', () => {
      const unknownError = {
        code: 'CUSTOM_ERROR',
        message: 'Custom error message',
        category: 'custom' as const,
        isRecoverable: true,
      };
      errorHandler.logError(unknownError, 'custom_operation');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Unexpected error:',
        expect.objectContaining({
          code: 'CUSTOM_ERROR',
          category: 'custom',
          operation: 'custom_operation',
        }),
      );
    });

    it('should include error data in log when present', () => {
      const errorWithData = {
        code: ERROR_CODES.CONNECTION_FAILED,
        message: 'Connection failed',
        category: 'network' as const,
        recoveryStrategy: 'wait_and_retry' as const,
        data: { attempt: 3, endpoint: 'api.example.com' },
      };
      errorHandler.logError(errorWithData, 'api_call');

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Recoverable network error:',
        expect.objectContaining({
          data: { attempt: 3, endpoint: 'api.example.com' },
        }),
      );
    });

    it('should use "unknown" operation when not provided', () => {
      const error = new Error('Test error');
      errorHandler.logError(error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Unexpected error:',
        expect.objectContaining({
          operation: 'unknown',
        }),
      );
    });
  });

  describe('Dispose Method', () => {
    it('should log disposal when logger is available', () => {
      errorHandler.dispose();

      expect(mockLogger.debug).toHaveBeenCalledWith('ErrorHandler disposing');
    });

    it('should handle disposal gracefully when logger is null', () => {
      // Create error handler with null logger
      // @ts-expect-error Testing with null logger for edge case handling
      const nullLoggerHandler = new ErrorHandler(null);

      // Should not throw
      expect(() => {
        nullLoggerHandler.dispose();
      }).not.toThrow();
    });
  });

  describe('Edge Case Input Handling', () => {
    it('should handle null input', () => {
      const result = errorHandler.handleError(null);

      expect(result.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
      expect(result.message).toBe('An unexpected error occurred');
      expect(result.category).toBe('general');
    });

    it('should handle undefined input', () => {
      const result = errorHandler.handleError(undefined);

      expect(result.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
      expect(result.message).toBe('An unexpected error occurred');
      expect(result.category).toBe('general');
    });

    it('should handle number input', () => {
      const result = errorHandler.handleError(404);

      expect(result.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
      expect(result.message).toBe('An unexpected error occurred');
      expect(result.category).toBe('general');
    });

    it('should handle object input', () => {
      const result = errorHandler.handleError({ custom: 'error' });

      expect(result.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
      expect(result.message).toBe('An unexpected error occurred');
      expect(result.category).toBe('general');
    });

    it('should handle case-insensitive pattern matching', () => {
      const upperCaseError = new Error('USER REJECTED THE REQUEST');
      const result = errorHandler.handleError(upperCaseError);

      expect(result.code).toBe(ERROR_CODES.USER_REJECTED);
      expect(result.category).toBe('user');
    });

    it('should handle mixed case pattern matching', () => {
      const mixedCaseError = new Error('Network Connection Failed');
      const result = errorHandler.handleError(mixedCaseError);

      expect(result.code).toBe(ERROR_CODES.NETWORK_ERROR);
      expect(result.category).toBe('network');
    });
  });
});
