/**
 * Tests for error cause preservation
 * Validates that error chains and stack traces are preserved through error transformations
 * @module causePreservation.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createMockLogger } from '../../../testing/index.js';
import { ErrorFactory } from './errorFactory.js';
import { ErrorHandler } from './errorHandler.js';

describe('Cause Preservation - ErrorFactory', () => {
  describe('connectorError', () => {
    it('should preserve cause when provided', () => {
      const originalError = new Error('Original wallet error');
      const result = ErrorFactory.connectorError('metamask', 'Connection failed', 'CONNECTION_FAILED', {
        cause: originalError,
      });

      expect(result.cause).toBe(originalError);
      expect((result.cause as Error).message).toBe('Original wallet error');
      expect((result.cause as Error).stack).toBeDefined();
    });

    it('should preserve cause with other options', () => {
      const originalError = new Error('Network timeout');
      const result = ErrorFactory.connectorError('walletconnect', 'Timeout', 'TIMEOUT', {
        cause: originalError,
        recoveryStrategy: 'retry',
        retryDelay: 1000,
        maxRetries: 3,
        operation: 'connect',
      });

      expect(result.cause).toBe(originalError);
      expect(result.recoveryStrategy).toBe('retry');
      expect(result.retryDelay).toBe(1000);
      expect(result.maxRetries).toBe(3);
    });

    it('should work without cause option', () => {
      const result = ErrorFactory.connectorError('phantom', 'Connection failed');

      expect(result.cause).toBeUndefined();
      expect(result.message).toBe('Connection failed');
    });

    it('should preserve non-Error objects as cause', () => {
      const errorObj = { code: 4001, message: 'User rejected' };
      const result = ErrorFactory.connectorError('metamask', 'User rejected', 'USER_REJECTED', {
        cause: errorObj,
      });

      expect(result.cause).toBe(errorObj);
      expect((result.cause as Record<string, unknown>).code).toBe(4001);
    });
  });

  describe('fromConnectorError', () => {
    it('should preserve Error instance as cause', () => {
      const originalError = new Error('MetaMask error');
      const result = ErrorFactory.fromConnectorError('metamask', originalError, 'connect');

      expect(result.cause).toBe(originalError);
      expect((result.cause as Error).message).toBe('MetaMask error');
      expect((result.cause as Error).stack).toBeDefined();
    });

    it('should preserve cause for user rejection', () => {
      const originalError = new Error('User rejected the request');
      const result = ErrorFactory.fromConnectorError('metamask', originalError);

      expect(result.cause).toBe(originalError);
      expect(result.code).toBe('USER_REJECTED');
      expect(result.recoveryStrategy).toBe('none');
    });

    it('should preserve cause for wallet not found', () => {
      const originalError = new Error('Wallet not found');
      const result = ErrorFactory.fromConnectorError('phantom', originalError);

      expect(result.cause).toBe(originalError);
      expect(result.code).toBe('WALLET_NOT_FOUND');
    });

    it('should preserve cause for network errors', () => {
      const originalError = new Error('Connection timeout');
      const result = ErrorFactory.fromConnectorError('walletconnect', originalError);

      expect(result.cause).toBe(originalError);
      expect(result.code).toBe('CONNECTION_FAILED');
      expect(result.recoveryStrategy).toBe('wait_and_retry');
    });

    it('should preserve string errors as cause', () => {
      const result = ErrorFactory.fromConnectorError('metamask', 'User rejected');

      expect(result.cause).toBe('User rejected');
    });

    it('should preserve object errors as cause', () => {
      const errorObj = { code: 4001, message: 'User denied transaction signature' };
      const result = ErrorFactory.fromConnectorError('metamask', errorObj);

      expect(result.cause).toBe(errorObj);
    });

    it('should preserve cause with operation context', () => {
      const originalError = new Error('Signature failed');
      const result = ErrorFactory.fromConnectorError('coinbase', originalError, 'signMessage');

      expect(result.cause).toBe(originalError);
      expect(result.data?.operation).toBe('signMessage');
    });
  });

  describe('Stack trace chain', () => {
    it('should maintain stack trace through error transformation', () => {
      const level1Error = new Error('Level 1');
      const level1Stack = level1Error.stack;

      const level2Error = ErrorFactory.fromConnectorError('metamask', level1Error);

      expect(level2Error.cause).toBe(level1Error);
      expect((level2Error.cause as Error).stack).toBe(level1Stack);
    });

    it('should create full error chain with multiple transformations', () => {
      const originalError = new Error('Original');

      // First transformation
      const connectorError = ErrorFactory.fromConnectorError('metamask', originalError, 'connect');

      // Verify chain
      expect(connectorError.cause).toBe(originalError);
      expect((connectorError.cause as Error).stack).toBeDefined();
    });
  });
});

describe('Cause Preservation - ErrorHandler', () => {
  let errorHandler: ErrorHandler;
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(() => {
    mockLogger = createMockLogger();
    errorHandler = new ErrorHandler(mockLogger);
  });

  describe('handleError', () => {
    it('should preserve Error instances as cause', () => {
      const originalError = new Error('Original error');
      const result = errorHandler.handleError(originalError);

      expect(result.cause).toBe(originalError);
      expect((result.cause as Error).message).toBe('Original error');
      expect((result.cause as Error).stack).toBeDefined();
    });

    it('should preserve cause with context', () => {
      const originalError = new Error('Connection failed');
      const result = errorHandler.handleError(originalError, {
        component: 'WalletConnector',
        operation: 'connect',
        walletId: 'metamask',
      });

      expect(result.cause).toBe(originalError);
      expect(result.data).toMatchObject({
        component: 'WalletConnector',
        operation: 'connect',
        walletId: 'metamask',
      });
    });

    it('should preserve cause for network errors', () => {
      const originalError = new Error('Network timeout');
      const result = errorHandler.handleError(originalError);

      expect(result.cause).toBe(originalError);
      expect(result.category).toBe('network');
      expect(result.recoveryStrategy).toBe('wait_and_retry');
    });

    it('should preserve cause for user rejection errors', () => {
      const originalError = new Error('User rejected the request');
      const result = errorHandler.handleError(originalError);

      expect(result.cause).toBe(originalError);
      expect(result.code).toBe('user_rejected');
    });

    it('should preserve cause for wallet not found errors', () => {
      const originalError = new Error('Wallet not found');
      const result = errorHandler.handleError(originalError, {
        walletId: 'phantom',
      });

      expect(result.cause).toBe(originalError);
      expect(result.code).toBe('wallet_not_found');
    });

    it('should preserve object errors as cause', () => {
      const errorObj = { code: 500, message: 'Internal error' };
      const result = errorHandler.handleError(errorObj);

      expect(result.cause).toBe(errorObj);
    });

    it('should not preserve primitive values as cause', () => {
      const result = errorHandler.handleError('string error');

      expect(result.cause).toBeUndefined();
      expect(result.message).toContain('unexpected');
    });

    it('should not preserve null as cause', () => {
      const result = errorHandler.handleError(null);

      expect(result.cause).toBeUndefined();
    });

    it('should return ModalError as-is without modification', () => {
      const modalError = ErrorFactory.connectionFailed('Failed');
      const result = errorHandler.handleError(modalError);

      expect(result).toBe(modalError);
      expect(result.cause).toBeUndefined(); // Original doesn't have cause
    });

    it('should preserve stack trace through handleError', () => {
      const originalError = new Error('Test');
      const originalStack = originalError.stack;

      const result = errorHandler.handleError(originalError);

      expect(result.cause).toBe(originalError);
      expect((result.cause as Error).stack).toBe(originalStack);
    });
  });

  describe('Integration with logging', () => {
    it('should log errors with preserved cause', () => {
      const originalError = new Error('Original');
      const modalError = errorHandler.handleError(originalError, {
        component: 'Test',
      });

      errorHandler.logError(modalError, 'testOperation');

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          code: expect.any(String),
          category: expect.any(String),
        }),
      );
    });
  });
});

describe('End-to-End Cause Preservation', () => {
  let errorHandler: ErrorHandler;
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(() => {
    mockLogger = createMockLogger();
    errorHandler = new ErrorHandler(mockLogger);
  });

  it('should preserve cause through complete error flow', () => {
    // Simulate a wallet error
    const walletError = new Error('MetaMask: User rejected transaction');

    // Transform through ErrorFactory
    const connectorError = ErrorFactory.fromConnectorError('metamask', walletError, 'signTransaction');

    // Verify ErrorFactory preserved cause
    expect(connectorError.cause).toBe(walletError);

    // Transform through ErrorHandler
    const handledError = errorHandler.handleError(connectorError);

    // Verify ErrorHandler preserved the ModalError
    expect(handledError).toBe(connectorError);
    expect(handledError.cause).toBe(walletError);
  });

  it('should maintain stack trace through multi-level transformation', () => {
    // Original error with stack trace
    const originalError = new Error('Database connection failed');
    const originalStack = originalError.stack;

    // Level 1: Transform to connector error
    const connectorError = ErrorFactory.fromConnectorError('walletconnect', originalError, 'connect');

    // Level 2: Handle error
    const handledError = errorHandler.handleError(connectorError, {
      component: 'ConnectionManager',
      retry: 3,
    });

    // Verify complete chain
    expect(handledError).toBe(connectorError);
    expect(handledError.cause).toBe(originalError);
    expect((handledError.cause as Error).stack).toBe(originalStack);
    expect(handledError.data).toMatchObject({
      component: 'ConnectionManager',
      retry: 3,
    });
  });

  it('should work with real wallet error scenarios', () => {
    // Simulate real MetaMask error
    const metamaskError = new Error('MetaMask Tx Signature: User denied transaction signature.');
    (metamaskError as Error & { code: number }).code = 4001;

    const result = ErrorFactory.fromConnectorError('metamask', metamaskError, 'sendTransaction');

    expect(result.cause).toBe(metamaskError);
    expect(result.code).toBe('USER_REJECTED');
    expect(result.data?.recoveryHint).toBe('user_action');
    expect((result.cause as Error).stack).toBeDefined();
  });
});