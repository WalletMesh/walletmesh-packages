/**
 * Tests for simplified ErrorFactory
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestEnvironment, installCustomMatchers } from '../../../testing/index.js';
import { ErrorFactory } from './errorFactory.js';
import { ERROR_CODES } from './types.js';
import { isFatalError } from './utils.js';

// Install custom matchers
installCustomMatchers();

describe('ErrorFactory', () => {
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('error creation', () => {
    it('should create a general error', () => {
      const error = ErrorFactory.create('custom_error', 'Custom error message');
      expect(error.code).toBe('custom_error');
      expect(error.message).toBe('Custom error message');
      expect(error.category).toBe('general');
      expect(error.isRecoverable).toBeUndefined(); // undefined means recoverable
    });

    it('should create error with specific category', () => {
      const error = ErrorFactory.create('test_error', 'Test message', 'network');
      expect(error.category).toBe('network');
      expect(error.isRecoverable).toBeUndefined(); // undefined means recoverable
    });

    it('should create error with data', () => {
      const data = { walletId: 'metamask' };
      const error = ErrorFactory.create('test_error', 'Test message', 'wallet', data);
      expect(error.data).toEqual(data);
      expect(error.isRecoverable).toBeUndefined(); // isRecoverable not explicitly set
    });

    it('should create error with explicit isRecoverable flag (false)', () => {
      const error = ErrorFactory.create('test_error', 'Test message', 'general', { isRecoverable: false });
      expect(error.data?.isRecoverable).toBe(false);
    });

    it('should create error with explicit isRecoverable flag (true)', () => {
      const error = ErrorFactory.create('test_error', 'Test message', 'general', { isRecoverable: true });
      expect(error.data?.isRecoverable).toBe(true);
    });
  });

  describe('predefined error types', () => {
    it('should create user rejected error', () => {
      const error = ErrorFactory.userRejected();
      expect(error.code).toBe('user_rejected');
      expect(error.category).toBe('user');
      // isRecoverable property is not returned by ErrorFactory methods
      expect(error.isRecoverable).toBeUndefined();
      expect(error.message).toBe('User cancelled the operation');
    });

    it('should create user rejected error with operation context', () => {
      const error = ErrorFactory.userRejected('connect_wallet');
      expect(error.data).toEqual({ operation: 'connect_wallet' });
      expect(error.isRecoverable).toBeUndefined();
    });

    it('should create wallet not found error', () => {
      const error = ErrorFactory.walletNotFound();
      expect(error.code).toBe('wallet_not_found');
      expect(error.category).toBe('wallet');
      // isRecoverable property is not returned by ErrorFactory methods
      expect(error.isRecoverable).toBeUndefined();
      expect(error.message).toBe('Wallet not found');
    });

    it('should create wallet not found error with wallet ID', () => {
      const error = ErrorFactory.walletNotFound('metamask');
      expect(error.message).toBe('metamask wallet not found');
      expect(error.isRecoverable).toBeUndefined();
    });

    it('should create connection failed error', () => {
      const error = ErrorFactory.connectionFailed();
      expect(error.code).toBe('connection_failed');
      expect(error.category).toBe('network');
      expect(error.isRecoverable).toBeUndefined(); // undefined means recoverable
      expect(error.message).toBe('Connection failed');
    });

    it('should create unknown error', () => {
      const error = ErrorFactory.unknownError();
      expect(error.code).toBe('unknown_error');
      expect(error.category).toBe('general');
      expect(error.isRecoverable).toBeUndefined(); // undefined means recoverable
      expect(error.message).toBe('An unexpected error occurred');
    });

    it('should create network error', () => {
      const error = ErrorFactory.networkError();
      expect(error.code).toBe('network_error');
      expect(error.category).toBe('network');
      expect(error.isRecoverable).toBeUndefined(); // undefined means recoverable
      expect(error.message).toBe('Network error');
    });

    it('should create timeout error', () => {
      const error = ErrorFactory.timeoutError();
      expect(error.code).toBe('request_timeout');
      expect(error.category).toBe('network');
      expect(error.isRecoverable).toBeUndefined(); // undefined means recoverable
      expect(error.message).toBe('Request timed out');
    });

    it('should create timeout error with custom message and data', () => {
      const customMessage = 'Custom timeout message';
      const customData = { timeout: 30000, operation: 'fetch' };
      const error = ErrorFactory.timeoutError(customMessage, customData);

      expect(error.code).toBe('request_timeout');
      expect(error.category).toBe('network');
      expect(error.message).toBe(customMessage);
      expect(error.data).toEqual(customData);
      expect(error.isRecoverable).toBeUndefined(); // undefined means recoverable
    });
  });

  describe('new convenience methods for error codes', () => {
    it('should create configuration error with correct properties', () => {
      const error = ErrorFactory.configurationError('Invalid config', { invalid: 'value' });

      expect(error.code).toBe(ERROR_CODES.CONFIGURATION_ERROR);
      expect(error.message).toBe('Invalid config');
      expect(error.category).toBe('general');
      expect(error.fatal).toBeUndefined(); // recoverable
      expect(error.data).toEqual({ details: { invalid: 'value' } });
    });

    it('should create transport error with correct properties', () => {
      const error = ErrorFactory.transportError('Transport failed', 'popup');

      expect(error.code).toBe(ERROR_CODES.TRANSPORT_UNAVAILABLE);
      expect(error.message).toBe('Transport failed');
      expect(error.category).toBe('network');
      expect(error.fatal).toBeUndefined(); // recoverable
      expect(error.data).toEqual({ transportType: 'popup' });
    });

    it('should create message failed error with correct properties', () => {
      const error = ErrorFactory.messageFailed('Send failed', { attempt: 1 });

      expect(error.code).toBe(ERROR_CODES.MESSAGE_FAILED);
      expect(error.message).toBe('Send failed');
      expect(error.category).toBe('network');
      expect(error.fatal).toBeUndefined(); // recoverable
      expect(error.data).toEqual({ attempt: 1 });
    });

    it('should create transport disconnected error with correct properties', () => {
      const error = ErrorFactory.transportDisconnected('Connection lost', 'timeout');

      expect(error.code).toBe(ERROR_CODES.TRANSPORT_DISCONNECTED);
      expect(error.message).toBe('Connection lost');
      expect(error.category).toBe('network');
      expect(error.fatal).toBeUndefined(); // recoverable
      expect(error.data).toEqual({ reason: 'timeout' });
    });

    it('should create render failed error with correct properties', () => {
      const error = ErrorFactory.renderFailed('Render error', 'WalletModal');

      expect(error.code).toBe(ERROR_CODES.RENDER_FAILED);
      expect(error.message).toBe('Render error');
      expect(error.category).toBe('general');
      expect(error.fatal).toBeUndefined(); // recoverable
      expect(error.data).toEqual({ component: 'WalletModal' });
    });

    it('should create mount failed error with correct properties', () => {
      const error = ErrorFactory.mountFailed('Mount error', '#modal-container');

      expect(error.code).toBe(ERROR_CODES.MOUNT_FAILED);
      expect(error.message).toBe('Mount error');
      expect(error.category).toBe('general');
      expect(error.fatal).toBeUndefined(); // recoverable
      expect(error.data).toEqual({ target: '#modal-container' });
    });

    it('should create cleanup failed error with correct properties', () => {
      const error = ErrorFactory.cleanupFailed('Cleanup error', 'destroyTransport');

      expect(error.code).toBe(ERROR_CODES.CLEANUP_FAILED);
      expect(error.message).toBe('Cleanup error');
      expect(error.category).toBe('general');
      expect(error.fatal).toBeUndefined(); // recoverable
      expect(error.data).toEqual({ operation: 'destroyTransport' });
    });

    it('should create invalid adapter error with correct properties (fatal)', () => {
      const error = ErrorFactory.invalidAdapter('Invalid adapter', 'CustomAdapter');

      expect(error.code).toBe(ERROR_CODES.INVALID_ADAPTER);
      expect(error.message).toBe('Invalid adapter');
      expect(error.category).toBe('general');
      // isRecoverable property is not returned by ErrorFactory methods
      expect(error.isRecoverable).toBeUndefined();
      expect(error.data).toEqual({ adapterType: 'CustomAdapter' });
    });

    it('should create invalid transport error with correct properties (fatal)', () => {
      const error = ErrorFactory.invalidTransport('Invalid transport', 'CustomTransport');

      expect(error.code).toBe(ERROR_CODES.INVALID_TRANSPORT);
      expect(error.message).toBe('Invalid transport');
      expect(error.category).toBe('general');
      // isRecoverable property is not returned by ErrorFactory methods
      expect(error.isRecoverable).toBeUndefined();
      expect(error.data).toEqual({ transportType: 'CustomTransport' });
    });

    it('should handle optional parameters correctly', () => {
      const configError = ErrorFactory.configurationError('Config error');
      const transportError = ErrorFactory.transportError('Transport error');

      expect(configError.data).toBeUndefined();
      expect(transportError.data).toBeUndefined();
    });
  });

  describe('utility function integration', () => {
    it('should correctly identify fatal errors with isFatalError', () => {
      const userError = ErrorFactory.userRejected();
      const walletError = ErrorFactory.walletNotFound();
      const networkError = ErrorFactory.connectionFailed();
      const unknownError = ErrorFactory.unknownError();

      // Debug output
      console.log('DEBUG walletError.recoveryStrategy:', walletError.recoveryStrategy);
      console.log('DEBUG walletError.constructor.name:', walletError.constructor.name);
      console.log('DEBUG isFatalError(walletError):', isFatalError(walletError));

      // User rejection has recoveryStrategy: 'none' - fatal
      expect(isFatalError(userError)).toBe(true);
      // Wallet not found has recoveryStrategy: 'manual_action' - not fatal
      expect(isFatalError(walletError)).toBe(false);
      // Connection failed has recoveryStrategy: 'wait_and_retry' - not fatal
      expect(isFatalError(networkError)).toBe(false);
      // Unknown error has no recoveryStrategy - fatal
      expect(isFatalError(unknownError)).toBe(true);
    });

    it('should handle explicitly set recoveryStrategy with utility functions', () => {
      const explicitlyFatal = ErrorFactory.create('test', 'message', 'general', { recoveryStrategy: 'none' });
      const explicitlyRecoverable = ErrorFactory.create('test', 'message', 'general', {
        recoveryStrategy: 'retry',
      });
      const defaultNoRecovery = ErrorFactory.create('test', 'message', 'general');

      // recoveryStrategy: 'none' - fatal
      expect(isFatalError(explicitlyFatal)).toBe(true);
      // recoveryStrategy: 'retry' - not fatal
      expect(isFatalError(explicitlyRecoverable)).toBe(false);
      // No recoveryStrategy - fatal
      expect(isFatalError(defaultNoRecovery)).toBe(true);
    });
  });

  describe('connector error methods', () => {
    describe('connectorError', () => {
      it('should create connector error with minimal parameters', () => {
        const error = ErrorFactory.connectorError('metamask', 'Failed to connect');

        expect(error.code).toBe('CONNECTOR_ERROR');
        expect(error.message).toBe('Failed to connect');
        expect(error.category).toBe('wallet');
        expect(error.isRecoverable).toBeUndefined(); // Not set by default
        expect(error.data).toEqual({
          component: 'connector',
          walletId: 'metamask',
        });
      });

      it('should create connector error with custom code', () => {
        const error = ErrorFactory.connectorError('metamask', 'User rejected', 'USER_REJECTED');

        expect(error.code).toBe('USER_REJECTED');
        expect(error.message).toBe('User rejected');
        expect(error.category).toBe('wallet');
        expect(error.isRecoverable).toBeUndefined(); // Not set by default
        expect(error.data).toEqual({
          component: 'connector',
          walletId: 'metamask',
        });
      });

      it('should create connector error with all options', () => {
        const originalError = new Error('Original error');
        const error = ErrorFactory.connectorError('walletconnect', 'Connection failed', 'CONNECTION_FAILED', {
          isRecoverable: false,
          operation: 'connect',
          originalError,
          recoveryHint: 'retry',
          data: { customData: 'value' },
        });

        expect(error.code).toBe('CONNECTION_FAILED');
        expect(error.message).toBe('Connection failed');
        expect(error.category).toBe('wallet');
        // Even with explicit isRecoverable option, it's not returned
        expect(error.isRecoverable).toBeUndefined();
        expect(error.data).toEqual({
          component: 'connector',
          walletId: 'walletconnect',
          operation: 'connect',
          recoveryHint: 'retry',
          originalError: 'Error: Original error',
          customData: 'value',
        });
      });

      it('should handle all recovery hints', () => {
        const hints = ['install_wallet', 'unlock_wallet', 'switch_chain', 'retry', 'user_action'] as const;

        for (const hint of hints) {
          const error = ErrorFactory.connectorError('test', 'Message', 'TEST_CODE', {
            recoveryHint: hint,
          });

          expect(error.data?.['recoveryHint']).toBe(hint);
        }
      });

      it('should not include undefined optional fields in data', () => {
        const error = ErrorFactory.connectorError('metamask', 'Test message');

        expect(error.data).toEqual({
          component: 'connector',
          walletId: 'metamask',
        });
        expect(error.data).not.toHaveProperty('operation');
        expect(error.data).not.toHaveProperty('recoveryHint');
        expect(error.data).not.toHaveProperty('originalError');
      });
    });

    describe('fromConnectorError', () => {
      it('should detect user rejection patterns', () => {
        const userRejectedErrors = [
          new Error('User rejected the request'),
          new Error('User denied transaction signature'),
          'user rejected connection',
          'User Rejected Request',
        ];

        for (const originalError of userRejectedErrors) {
          const error = ErrorFactory.fromConnectorError('metamask', originalError, 'connect');

          expect(error.code).toBe('USER_REJECTED');
          // isRecoverable is not returned even by fromConnectorError
          expect(error.isRecoverable).toBeUndefined();
          expect(error.data?.['recoveryHint']).toBe('user_action');
          expect(error.data?.['operation']).toBe('connect');
        }
      });

      it('should detect wallet locked patterns', () => {
        const lockedErrors = [new Error('Wallet is locked'), 'Please unlock your wallet', 'WALLET_LOCKED'];

        for (const originalError of lockedErrors) {
          const error = ErrorFactory.fromConnectorError('metamask', originalError);

          expect(error.code).toBe('WALLET_LOCKED');
          // isRecoverable is not returned even by fromConnectorError
          expect(error.isRecoverable).toBeUndefined();
          expect(error.data?.['recoveryHint']).toBe('unlock_wallet');
        }
      });

      it('should detect wallet not found patterns', () => {
        const notFoundErrors = [
          new Error('Wallet not found'),
          'MetaMask not installed',
          'Provider not found',
        ];

        for (const originalError of notFoundErrors) {
          const error = ErrorFactory.fromConnectorError('metamask', originalError);

          expect(error.code).toBe('WALLET_NOT_FOUND');
          // isRecoverable is not returned even by fromConnectorError
          expect(error.isRecoverable).toBeUndefined();
          expect(error.data?.['recoveryHint']).toBe('install_wallet');
        }
      });

      it('should detect chain/network patterns', () => {
        const chainErrors = [new Error('Unsupported chain'), 'Network not supported', 'Invalid chain ID'];

        for (const originalError of chainErrors) {
          const error = ErrorFactory.fromConnectorError('metamask', originalError);

          expect(error.code).toBe('UNSUPPORTED_CHAIN');
          // isRecoverable is not returned even by fromConnectorError
          expect(error.isRecoverable).toBeUndefined();
          expect(error.data?.['recoveryHint']).toBe('switch_chain');
        }
      });

      it('should detect timeout/connection patterns', () => {
        const connectionErrors = [
          new Error('Connection timeout'),
          'Failed to connect to provider',
          'Request timeout',
        ];

        for (const originalError of connectionErrors) {
          const error = ErrorFactory.fromConnectorError('metamask', originalError);

          expect(error.code).toBe('CONNECTION_FAILED');
          // isRecoverable is not returned even by fromConnectorError
          expect(error.isRecoverable).toBeUndefined();
          expect(error.data?.['recoveryHint']).toBe('retry');
        }
      });

      it('should fallback to generic connector error for unknown patterns', () => {
        const unknownError = new Error('Some unknown error');
        const error = ErrorFactory.fromConnectorError('custom-wallet', unknownError, 'unknown-op');

        expect(error.code).toBe('CONNECTOR_ERROR');
        // isRecoverable is not returned even by fromConnectorError
        expect(error.isRecoverable).toBeUndefined();
        expect(error.data?.['recoveryHint']).toBeUndefined();
        expect(error.data?.['operation']).toBe('unknown-op');
        expect(error.data?.['originalError']).toBe('Error: Some unknown error');
      });

      it('should handle non-Error objects', () => {
        const stringError = 'Simple string error';
        const error = ErrorFactory.fromConnectorError('metamask', stringError);

        expect(error.message).toBe('Simple string error');
        expect(error.data?.['originalError']).toBe('Simple string error');
      });

      it('should preserve original error in data', () => {
        const originalError = new Error('Original error message');
        const error = ErrorFactory.fromConnectorError('metamask', originalError, 'test-operation');

        expect(error.data?.['originalError']).toBe('Error: Original error message');
        expect(error.data?.['operation']).toBe('test-operation');
      });

      it('should create proper wallet category errors', () => {
        const error = ErrorFactory.fromConnectorError('test-wallet', new Error('Test'));

        expect(error.category).toBe('wallet');
        expect(error.data?.['component']).toBe('connector');
        expect(error.data?.['walletId']).toBe('test-wallet');
      });
    });
  });
});
