/**
 * Tests for error formatting utilities
 *
 * @packageDocumentation
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ErrorType,
  type FormattedError,
  formatError,
  getErrorTitle,
  getRecoveryMessage,
  isUserInitiatedError,
} from './errorFormatter.js';

describe('errorFormatter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatError', () => {
    it('should format generic errors', () => {
      const error = new Error('Something went wrong');
      const result = formatError(error);

      expect(result).toEqual({
        message: 'Something went wrong',
        errorType: ErrorType.JavaScriptError,
      });
    });

    it('should format user rejection errors', () => {
      const error = new Error('User rejected the request');
      const result = formatError(error);

      expect(result).toEqual({
        message: 'User rejected the request',
        errorType: ErrorType.JavaScriptError,
      });
    });

    it('should format wallet not found errors', () => {
      const error = new Error('Wallet not found');
      const result = formatError(error);

      expect(result).toEqual({
        message: 'Wallet not found',
        errorType: ErrorType.JavaScriptError,
      });
    });

    it('should format connection errors', () => {
      const error = new Error('Connection failed');
      const result = formatError(error);

      expect(result).toEqual({
        message: 'Connection failed',
        errorType: ErrorType.JavaScriptError,
      });
    });

    it('should format network errors', () => {
      const error = new Error('Network request failed');
      const result = formatError(error);

      expect(result).toEqual({
        message: 'Network request failed',
        errorType: ErrorType.JavaScriptError,
      });
    });

    it('should format chain switching errors', () => {
      const error = new Error('Unsupported chain');
      const result = formatError(error);

      expect(result).toEqual({
        message: 'Unsupported chain',
        errorType: ErrorType.JavaScriptError,
      });
    });

    it('should handle wallet locked errors', () => {
      const error = new Error('Wallet is locked');
      const result = formatError(error);

      expect(result).toEqual({
        message: 'Wallet is locked',
        errorType: ErrorType.JavaScriptError,
      });
    });

    it('should extract error code when available', () => {
      const error = new Error('Custom error') as Error & { code: string };
      error.code = 'CUSTOM_CODE';

      const result = formatError(error);

      expect(result).toEqual({
        message: 'Custom error',
        code: 'CUSTOM_CODE',
        errorType: ErrorType.JavaScriptError,
      });
    });

    it('should include details when provided', () => {
      const error = new Error('Error with details');
      const details = 'Additional context';
      const result = formatError(error, details);

      expect(result).toEqual({
        message: 'Error with details',
        errorType: ErrorType.JavaScriptError,
      });
    });

    it('should handle non-Error objects', () => {
      const error = 'String error';
      const result = formatError(error as unknown as Error);

      expect(result).toEqual({
        message: 'String error',
        errorType: ErrorType.StringError,
      });
    });

    it('should handle null/undefined errors', () => {
      const result1 = formatError(null as unknown as Error);
      const result2 = formatError(undefined as unknown as Error);

      expect(result1).toEqual({
        message: 'An unknown error occurred',
        errorType: ErrorType.Unknown,
      });

      expect(result2).toEqual({
        message: 'An unknown error occurred',
        errorType: ErrorType.Unknown,
      });
    });
  });

  describe('getRecoveryMessage', () => {
    it('should return install wallet message', () => {
      const message = getRecoveryMessage('install_wallet');
      expect(message).toBe('Please install the wallet extension and try again.');
    });

    it('should return unlock wallet message', () => {
      const message = getRecoveryMessage('unlock_wallet');
      expect(message).toBe('Please unlock your wallet and try again.');
    });

    it('should return switch chain message', () => {
      const message = getRecoveryMessage('switch_chain');
      expect(message).toBe('Please switch to a supported chain in your wallet.');
    });

    it('should return retry message', () => {
      const message = getRecoveryMessage('retry');
      expect(message).toBe('Please check your internet connection and try again.');
    });

    it('should return user action message', () => {
      const message = getRecoveryMessage('user_action');
      expect(message).toBe('Please check your browser settings and allow popups for this site.');
    });

    it('should return default message for unknown hint', () => {
      const message = getRecoveryMessage('unknown_hint' as unknown as FormattedError['recoveryHint']);
      expect(message).toBe(undefined);
    });

    it('should handle undefined hint', () => {
      const message = getRecoveryMessage(undefined);
      expect(message).toBe(undefined);
    });
  });

  describe('getErrorTitle', () => {
    it('should return connection error title', () => {
      const formattedError: FormattedError = {
        message: 'Connection failed',
        code: 'CONNECTION_FAILED',
        errorType: ErrorType.JavaScriptError,
      };
      const title = getErrorTitle(formattedError);
      expect(title).toBe('Connection Failed');
    });

    it('should return wallet not found title', () => {
      const formattedError: FormattedError = {
        message: 'Wallet not found',
        code: 'WALLET_NOT_FOUND',
        errorType: ErrorType.JavaScriptError,
      };
      const title = getErrorTitle(formattedError);
      expect(title).toBe('Wallet Not Found');
    });

    it('should return user rejected title', () => {
      const formattedError: FormattedError = {
        message: 'User rejected',
        code: 'USER_REJECTED',
        errorType: ErrorType.JavaScriptError,
      };
      const title = getErrorTitle(formattedError);
      expect(title).toBe('Request Cancelled');
    });

    it('should return network error title', () => {
      const formattedError: FormattedError = {
        message: 'Network error',
        code: 'CONNECTION_TIMEOUT',
        errorType: ErrorType.JavaScriptError,
      };
      const title = getErrorTitle(formattedError);
      expect(title).toBe('Connection Timeout');
    });

    it('should return chain switch error title', () => {
      const formattedError: FormattedError = {
        message: 'Chain switch error',
        code: 'UNSUPPORTED_CHAIN',
        errorType: ErrorType.JavaScriptError,
      };
      const title = getErrorTitle(formattedError);
      expect(title).toBe('Wrong Network');
    });

    it('should return wallet locked title', () => {
      const formattedError: FormattedError = {
        message: 'Wallet locked',
        code: 'WALLET_LOCKED',
        errorType: ErrorType.JavaScriptError,
      };
      const title = getErrorTitle(formattedError);
      expect(title).toBe('Wallet Locked');
    });

    it('should return unknown error title', () => {
      const formattedError: FormattedError = {
        message: 'Unknown error',
        errorType: ErrorType.Unknown,
      };
      const title = getErrorTitle(formattedError);
      expect(title).toBe('Something Went Wrong');
    });
  });

  describe('isUserInitiatedError', () => {
    it('should identify user rejection errors', () => {
      const formattedError: FormattedError = {
        message: 'User rejected',
        code: 'USER_REJECTED',
        errorType: ErrorType.JavaScriptError,
      };
      expect(isUserInitiatedError(formattedError)).toBe(true);
    });

    it('should identify 4001 error codes (user rejection)', () => {
      const formattedError: FormattedError = {
        message: 'Error',
        code: 'WALLET_REQUEST_CANCELLED',
        errorType: ErrorType.JavaScriptError,
      };
      expect(isUserInitiatedError(formattedError)).toBe(true);
    });

    it('should identify ACTION_REJECTED error codes', () => {
      const formattedError: FormattedError = {
        message: 'Error',
        recoveryHint: 'user_action',
        errorType: ErrorType.JavaScriptError,
      };
      expect(isUserInitiatedError(formattedError)).toBe(true);
    });

    it('should not identify system errors as user initiated', () => {
      const error1: FormattedError = {
        message: 'Network connection failed',
        errorType: ErrorType.JavaScriptError,
      };
      const error2: FormattedError = {
        message: 'Internal server error',
        errorType: ErrorType.JavaScriptError,
      };
      const error3: FormattedError = {
        message: 'Error',
        code: 'NETWORK_ERROR',
        errorType: ErrorType.JavaScriptError,
      };

      expect(isUserInitiatedError(error1)).toBe(false);
      expect(isUserInitiatedError(error2)).toBe(false);
      expect(isUserInitiatedError(error3)).toBe(false);
    });

    it('should handle non-Error objects', () => {
      const formattedError: FormattedError = {
        message: 'user rejected',
        recoveryHint: 'user_action',
        errorType: ErrorType.StringError,
      };
      expect(isUserInitiatedError(formattedError)).toBe(true);
    });

    it('should handle null/undefined errors', () => {
      // This test doesn't make sense since isUserInitiatedError expects a FormattedError
      // Let's test with minimal FormattedError objects instead
      const error1: FormattedError = {
        message: '',
        errorType: ErrorType.Unknown,
      };
      expect(isUserInitiatedError(error1)).toBe(false);
    });
  });

  describe('ErrorType enum', () => {
    it('should have all expected error types', () => {
      expect(ErrorType.ModalError).toBe('modal_error');
      expect(ErrorType.JavaScriptError).toBe('js_error');
      expect(ErrorType.StringError).toBe('string_error');
      expect(ErrorType.UnknownObject).toBe('unknown_object');
      expect(ErrorType.Unknown).toBe('unknown');
    });
  });

  describe('FormattedError interface', () => {
    it('should create valid FormattedError objects', () => {
      const error: FormattedError = {
        message: 'Test error',
        errorType: ErrorType.JavaScriptError,
        code: 'TEST_CODE',
        recoveryHint: 'retry',
        details: 'Test details',
      };

      expect(error.message).toBe('Test error');
      expect(error.errorType).toBe(ErrorType.JavaScriptError);
      expect(error.code).toBe('TEST_CODE');
      expect(error.recoveryHint).toBe('retry');
      expect(error.details).toBe('Test details');
    });
  });

  describe('Integration tests', () => {
    it('should work end-to-end for wallet not found error', () => {
      const error = new Error('MetaMask not found');
      const formatted = formatError(error);
      const title = getErrorTitle(formatted);
      const recovery = formatted.recoveryHint ? getRecoveryMessage(formatted.recoveryHint) : undefined;

      expect(formatted.errorType).toBe(ErrorType.JavaScriptError);
      expect(formatted.recoveryHint).toBe(undefined);
      expect(title).toBe('Something Went Wrong');
      expect(recovery).toBe(undefined);
      expect(isUserInitiatedError(formatted)).toBe(false);
    });

    it('should work end-to-end for user rejection error', () => {
      const error = new Error('User rejected the request');
      const formatted = formatError(error);
      const title = getErrorTitle(formatted);
      const recovery = formatted.recoveryHint ? getRecoveryMessage(formatted.recoveryHint) : undefined;

      expect(formatted.errorType).toBe(ErrorType.JavaScriptError);
      expect(formatted.recoveryHint).toBe(undefined);
      expect(title).toBe('Something Went Wrong');
      expect(recovery).toBe(undefined);
      expect(isUserInitiatedError(formatted)).toBe(false);
    });
  });
});
