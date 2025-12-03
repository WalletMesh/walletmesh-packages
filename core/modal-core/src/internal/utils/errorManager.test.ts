import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { testSetupPatterns } from '../../testing/index.js';
import type { ModalError } from '../../types.js';
import {
  WALLET_ERROR_CODES,
  categorizeError,
  createModalError,
  getRecoveryActions,
  getUserFriendlyMessage,
  isWalletMeshError,
  toModalError,
} from './errorManager.js';

describe('errorManager', () => {
  // Use centralized test setup pattern
  const testEnv = testSetupPatterns.standard();

  beforeEach(async () => {
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('WALLET_ERROR_CODES', () => {
    it('should contain expected error codes', () => {
      expect(WALLET_ERROR_CODES.USER_REJECTED).toBe(4001);
      expect(WALLET_ERROR_CODES.UNAUTHORIZED).toBe(4100);
      expect(WALLET_ERROR_CODES.UNSUPPORTED_METHOD).toBe(4200);
      expect(WALLET_ERROR_CODES.DISCONNECTED).toBe(4900);
      expect(WALLET_ERROR_CODES.CHAIN_DISCONNECTED).toBe(4901);
      expect(WALLET_ERROR_CODES.CHAIN_NOT_ADDED).toBe(4902);
      expect(WALLET_ERROR_CODES.RESOURCE_NOT_FOUND).toBe(-32001);
      expect(WALLET_ERROR_CODES.PARSE_ERROR).toBe(-32700);
      expect(WALLET_ERROR_CODES.INVALID_REQUEST).toBe(-32600);
      expect(WALLET_ERROR_CODES.INTERNAL_ERROR).toBe(-32603);
    });
  });

  describe('isWalletMeshError', () => {
    it('should return true for valid ModalError', () => {
      const modalError: ModalError = {
        code: 'TEST_ERROR',
        message: 'Test error',
        category: 'general',
        isRecoverable: true,
      };

      expect(isWalletMeshError(modalError)).toBe(true);
    });

    it('should return false for regular Error object', () => {
      const regularError = new Error('Regular error');
      expect(isWalletMeshError(regularError)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isWalletMeshError(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isWalletMeshError(undefined)).toBe(false);
    });

    it('should return false for string', () => {
      expect(isWalletMeshError('error string')).toBe(false);
    });

    it('should return false for object missing required properties', () => {
      const incompleteError = {
        code: 'TEST_ERROR',
        message: 'Test error',
        // missing category and isRecoverable
      };

      expect(isWalletMeshError(incompleteError)).toBe(false);
    });
  });

  describe('categorizeError', () => {
    it('should return category from ModalError', () => {
      const modalError: ModalError = {
        code: 'TEST_ERROR',
        message: 'Test error',
        category: 'network',
        isRecoverable: true,
      };

      expect(categorizeError(modalError)).toBe('network');
    });

    it('should return general for ModalError with unknown category', () => {
      const modalError = {
        code: 'TEST_ERROR',
        message: 'Test error',
        category: 'unknown' as 'general',
        isRecoverable: true,
      };

      expect(categorizeError(modalError)).toBe('general');
    });

    it('should categorize user rejection errors', () => {
      const userRejectionError = { message: 'User rejected the request', code: 4001 };
      expect(categorizeError(userRejectionError)).toBe('user');
    });

    it('should categorize network errors', () => {
      const networkError = { message: 'Network connection failed' };
      expect(categorizeError(networkError)).toBe('network');
    });

    it('should categorize wallet errors', () => {
      const walletError = { message: 'MetaMask wallet is locked' };
      expect(categorizeError(walletError)).toBe('wallet');
    });

    it('should categorize provider errors as general', () => {
      const providerError = { message: 'Provider method not supported' };
      expect(categorizeError(providerError)).toBe('general');
    });

    it('should categorize transaction errors as general', () => {
      const transactionError = { message: 'Transaction failed due to insufficient gas' };
      expect(categorizeError(transactionError)).toBe('general');
    });

    it('should categorize connection errors as network', () => {
      const connectionError = { message: 'Failed to connect to RPC' };
      expect(categorizeError(connectionError)).toBe('network');
    });

    it('should return general for unknown error types', () => {
      const unknownError = { message: 'Something unexpected happened' };
      expect(categorizeError(unknownError)).toBe('general');
    });

    it('should handle errors without message', () => {
      const errorWithoutMessage = { code: 'SOME_ERROR' };
      expect(categorizeError(errorWithoutMessage)).toBe('general');
    });

    it('should handle non-object errors', () => {
      expect(categorizeError('string error')).toBe('general');
      expect(categorizeError(123)).toBe('general');
      expect(categorizeError(null)).toBe('general');
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return predefined message for ModalError', () => {
      const modalError: ModalError = {
        code: 'TEST_ERROR',
        message: 'Technical error message',
        category: 'network',
        isRecoverable: true,
      };

      const friendlyMessage = getUserFriendlyMessage(modalError);
      expect(friendlyMessage).toBe(
        'Network connection issue. Please check your internet connection and try again.',
      );
    });

    it('should handle user rejection errors', () => {
      const userRejectionError = { message: 'User rejected request' };
      const friendlyMessage = getUserFriendlyMessage(userRejectionError);
      expect(friendlyMessage).toBe(
        'You cancelled the wallet request. Please try again if you want to continue.',
      );
    });

    it('should handle wallet not found errors', () => {
      const walletNotFoundError = { message: 'Ethereum is not defined' };
      const friendlyMessage = getUserFriendlyMessage(walletNotFoundError);
      expect(friendlyMessage).toBe(
        'Wallet not found. Please make sure your wallet is installed and unlocked.',
      );
    });

    it('should handle network errors', () => {
      const networkError = { message: 'Network timeout occurred' };
      const friendlyMessage = getUserFriendlyMessage(networkError);
      expect(friendlyMessage).toBe(
        'Network connection issue. Please check your internet connection and try again.',
      );
    });

    it('should handle chain errors', () => {
      const chainError = { message: 'Chain not supported', code: 4902 };
      const friendlyMessage = getUserFriendlyMessage(chainError);
      expect(friendlyMessage).toBe(
        'Blockchain network error. Please try switching networks or try again later.',
      );
    });

    it('should handle transaction errors', () => {
      const transactionError = { message: 'Insufficient gas for transaction' };
      const friendlyMessage = getUserFriendlyMessage(transactionError);
      expect(friendlyMessage).toBe('Transaction failed. Please check your balance and gas settings.');
    });

    it('should handle provider errors', () => {
      const providerError = { message: 'RPC method not supported' };
      const friendlyMessage = getUserFriendlyMessage(providerError);
      expect(friendlyMessage).toBe(
        'Wallet provider error. Please try refreshing the page or using a different wallet.',
      );
    });

    it('should return user-friendly message as is', () => {
      const userFriendlyError = { message: 'Please confirm the action in your wallet' };
      const friendlyMessage = getUserFriendlyMessage(userFriendlyError);
      expect(friendlyMessage).toBe('Please confirm the action in your wallet');
    });

    it('should return default message for unknown errors', () => {
      const unknownError = { message: 'TypeError: undefined is not a function at line 123' };
      const friendlyMessage = getUserFriendlyMessage(unknownError);
      expect(friendlyMessage).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle errors without message property', () => {
      const errorWithoutMessage = { code: 'SOME_ERROR' };
      const friendlyMessage = getUserFriendlyMessage(errorWithoutMessage);
      expect(friendlyMessage).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle non-object errors', () => {
      expect(getUserFriendlyMessage('string error')).toBe('An unexpected error occurred. Please try again.');
      expect(getUserFriendlyMessage(null)).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('getRecoveryActions', () => {
    it('should return retry action for user errors', () => {
      const userError = { message: 'User rejected the request', code: 4001 };
      const actions = getRecoveryActions(userError);

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('retry');
      expect(actions[0].label).toBe('Try Again');
    });

    it('should return retry and refresh actions for network errors', () => {
      const networkError = { message: 'Network connection failed' };
      const actions = getRecoveryActions(networkError);

      expect(actions).toHaveLength(2);
      expect(actions[0].type).toBe('retry');
      expect(actions[1].type).toBe('refresh');
    });

    it('should return install and refresh actions for wallet not found errors', () => {
      const walletNotFoundError = { message: 'Ethereum is not defined' };
      const actions = getRecoveryActions(walletNotFoundError);

      expect(actions).toHaveLength(2);
      expect(actions[0].type).toBe('install');
      expect(actions[1].type).toBe('refresh');
    });

    it('should return unlock and retry actions for wallet errors', () => {
      const walletError = { message: 'MetaMask is locked' };
      const actions = getRecoveryActions(walletError);

      expect(actions).toHaveLength(2);
      expect(actions[0].type).toBe('unlock');
      expect(actions[1].type).toBe('retry');
    });

    it('should return default actions for general errors', () => {
      const generalError = { message: 'Something went wrong' };
      const actions = getRecoveryActions(generalError);

      expect(actions).toHaveLength(2);
      expect(actions[0].type).toBe('retry');
      expect(actions[1].type).toBe('refresh');
    });

    it('should include action descriptions', () => {
      const userError = { message: 'User rejected the request' };
      const actions = getRecoveryActions(userError);

      expect(actions[0].description).toBe('Attempt the wallet request again');
    });
  });

  describe('createModalError', () => {
    it('should create ModalError with required properties', () => {
      const error = createModalError('TEST_CODE', 'Test message');

      expect(error.code).toBe('TEST_CODE');
      expect(error.message).toBe('Test message');
      expect(error.category).toBe('general');
      expect(error.isRecoverable).toBe(true);
    });

    it('should create ModalError with custom category and isRecoverable flag', () => {
      const error = createModalError('TEST_CODE', 'Test message', 'network', false);

      expect(error.category).toBe('network');
      expect(error.isRecoverable).toBe(false);
    });

    it('should include data when provided', () => {
      const data = { userId: '123', operation: 'connect' };
      const error = createModalError('TEST_CODE', 'Test message', 'wallet', true, data);

      expect(error.data).toEqual(data);
    });

    it('should not include data property when not provided', () => {
      const error = createModalError('TEST_CODE', 'Test message');

      expect('data' in error).toBe(false);
    });
  });

  describe('toModalError', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2023-01-01T00:00:00Z'));
    });

    it('should return ModalError as is', () => {
      const modalError: ModalError = {
        code: 'TEST_ERROR',
        message: 'Test error',
        category: 'network',
        isRecoverable: true,
      };

      const result = toModalError(modalError);
      expect(result).toBe(modalError);
    });

    it('should convert Error object to ModalError', () => {
      const regularError = new Error('Test error message');
      const result = toModalError(regularError);

      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.message).toBe('Test error message');
      expect(result.category).toBe('general');
      expect(result.isRecoverable).toBe(false);
      expect(result.data?.timestamp).toBe(Date.now());
    });

    it('should include context in message', () => {
      const error = new Error('Connection failed');
      const result = toModalError(error, 'wallet_connect');

      expect(result.message).toBe('wallet_connect: Connection failed');
    });

    it('should extract error code when available', () => {
      const errorWithCode = { message: 'User rejected', code: 4001 };
      const result = toModalError(errorWithCode);

      expect(result.code).toBe('4001');
    });

    it('should include original error name in data', () => {
      const error = new TypeError('Type error occurred');
      const result = toModalError(error);

      expect(result.data?.originalError).toBe('TypeError');
    });

    it('should handle string errors', () => {
      const result = toModalError('String error message');

      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.message).toBe('String error message');
      expect(result.category).toBe('general');
    });

    it('should handle null errors', () => {
      const result = toModalError(null);

      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.message).toBe('null');
      expect(result.category).toBe('general');
    });

    it('should categorize error correctly', () => {
      const networkError = { message: 'Network timeout' };
      const result = toModalError(networkError);

      expect(result.category).toBe('network');
      expect(result.isRecoverable).toBe(true); // network errors are recoverable
    });
  });

  describe('error detection helpers', () => {
    describe('user rejection detection', () => {
      it('should detect user rejection by code', () => {
        const error = { message: 'Request failed', code: 4001 };
        expect(categorizeError(error)).toBe('user');
      });

      it('should detect user rejection by message', () => {
        const errors = [
          { message: 'User rejected the request' },
          { message: 'User denied transaction' },
          { message: 'Request was cancelled' },
          { message: 'Transaction rejected by user' },
        ];

        for (const error of errors) {
          expect(categorizeError(error)).toBe('user');
        }
      });
    });

    describe('wallet not found detection', () => {
      it('should detect wallet not found errors', () => {
        const errors = [
          { message: 'Wallet not found' },
          { message: 'MetaMask not installed' },
          { message: 'Provider not available' },
          { message: 'ethereum is not defined' },
          { message: 'No provider detected' },
        ];

        for (const error of errors) {
          expect(categorizeError(error)).toBe('wallet');
        }
      });
    });

    describe('network error detection', () => {
      it('should detect network errors', () => {
        const errors = [
          { message: 'Network error occurred' },
          { message: 'Fetch request failed' },
          { message: 'Connection timeout' },
          { message: 'Internet connection lost' },
          { name: 'NetworkError', message: 'Failed to fetch' },
        ];

        for (const error of errors) {
          expect(categorizeError(error)).toBe('network');
        }
      });
    });

    describe('chain error detection', () => {
      it('should detect chain errors by code', () => {
        const errors = [
          { message: 'Chain error', code: 4901 },
          { message: 'Chain error', code: 4902 },
        ];

        for (const error of errors) {
          expect(categorizeError(error)).toBe('general'); // chain errors are categorized as general
        }
      });

      it('should detect chain errors by message', () => {
        const chainError = { message: 'Chain not supported' };
        expect(categorizeError(chainError)).toBe('general'); // Chain errors are categorized as general

        const networkError = { message: 'Network switch failed' };
        expect(categorizeError(networkError)).toBe('network'); // Contains "network" keyword
      });
    });
  });

  describe('user-friendly message detection', () => {
    it('should detect technical messages', () => {
      const technicalError = {
        message: 'TypeError: Cannot read property undefined of null at ethereum.request',
      };
      const friendlyMessage = getUserFriendlyMessage(technicalError);
      expect(friendlyMessage).toBe('An unexpected error occurred. Please try again.');
    });

    it('should preserve genuinely user-friendly messages', () => {
      const friendlyError = {
        message: 'Please confirm the transaction in your wallet',
      };
      const friendlyMessage = getUserFriendlyMessage(friendlyError);
      expect(friendlyMessage).toBe('Please confirm the transaction in your wallet');
    });

    it('should reject messages with stack traces', () => {
      const stackTraceError = {
        message: 'Error occurred\nat Function.request (wallet.js:123)\nat connect (app.js:456)',
      };
      const friendlyMessage = getUserFriendlyMessage(stackTraceError);
      expect(friendlyMessage).toBe('An unexpected error occurred. Please try again.');
    });

    it('should reject overly long messages', () => {
      const longMessage = 'A'.repeat(250);
      const longError = { message: longMessage };
      const friendlyMessage = getUserFriendlyMessage(longError);
      expect(friendlyMessage).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('ModalError message handling', () => {
    it('should return specific messages for each category', () => {
      const networkError: ModalError = {
        code: 'NETWORK_ERROR',
        message: 'Technical network message',
        category: 'network',
        isRecoverable: true,
      };

      const walletError: ModalError = {
        code: 'WALLET_ERROR',
        message: 'Technical wallet message',
        category: 'wallet',
        isRecoverable: true,
      };

      const userError: ModalError = {
        code: 'USER_ERROR',
        message: 'Technical user message',
        category: 'user',
        isRecoverable: true,
      };

      const generalError: ModalError = {
        code: 'GENERAL_ERROR',
        message: 'Technical general message',
        category: 'general',
        isRecoverable: true,
      };

      expect(getUserFriendlyMessage(networkError)).toBe(
        'Network connection issue. Please check your internet connection and try again.',
      );
      expect(getUserFriendlyMessage(walletError)).toBe(
        'Wallet connection failed. Please ensure your wallet is unlocked and try again.',
      );
      expect(getUserFriendlyMessage(userError)).toBe(
        'You cancelled the wallet request. Please try again if you want to continue.',
      );
      expect(getUserFriendlyMessage(generalError)).toBe('Technical general message');
    });

    it('should fallback to default message for ModalError without message', () => {
      const errorWithoutMessage: ModalError = {
        code: 'NO_MESSAGE',
        message: '',
        category: 'general',
        isRecoverable: true,
      };

      expect(getUserFriendlyMessage(errorWithoutMessage)).toBe(
        'An unexpected error occurred with wallet connection.',
      );
    });
  });
});
