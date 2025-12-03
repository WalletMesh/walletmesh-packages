import { describe, expect, it } from 'vitest';
import {
  WalletMeshErrorCode,
  WalletMeshErrorImpl,
  WalletMeshErrors,
  createWalletMeshError,
  getErrorMessage,
  isRecoverableError,
  isWalletMeshError,
} from './errors.js';

describe('WalletMesh Error Types', () => {
  describe('WalletMeshErrorCode enum', () => {
    it('should contain all expected error codes', () => {
      expect(WalletMeshErrorCode.USER_REJECTED).toBe('USER_REJECTED');
      expect(WalletMeshErrorCode.CONNECTION_FAILED).toBe('CONNECTION_FAILED');
      expect(WalletMeshErrorCode.CHAIN_MISMATCH).toBe('CHAIN_MISMATCH');
      expect(WalletMeshErrorCode.WALLET_NOT_FOUND).toBe('WALLET_NOT_FOUND');
      expect(WalletMeshErrorCode.TRANSACTION_FAILED).toBe('TRANSACTION_FAILED');
      expect(WalletMeshErrorCode.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });

    it('should have consistent error code structure', () => {
      const errorCodes = Object.values(WalletMeshErrorCode);

      // All error codes should be uppercase with underscores
      for (const code of errorCodes) {
        expect(code).toMatch(/^[A-Z_]+$/);
      }

      // Should have reasonable number of error codes
      expect(errorCodes.length).toBeGreaterThan(10);
      expect(errorCodes.length).toBeLessThan(50);
    });
  });

  describe('WalletMeshErrorImpl class', () => {
    it('should create error with required properties', () => {
      const error = new WalletMeshErrorImpl(WalletMeshErrorCode.CONNECTION_FAILED, 'Connection failed');

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('WalletMeshError');
      expect(error.code).toBe(WalletMeshErrorCode.CONNECTION_FAILED);
      expect(error.message).toBe('Connection failed');
      expect(error.details).toBeUndefined();
      expect(error.originalError).toBeUndefined();
    });

    it('should create error with optional properties', () => {
      const originalError = new Error('Original error');
      const details = { chainId: '1', walletId: 'evm-wallet-1' };

      const error = new WalletMeshErrorImpl(
        WalletMeshErrorCode.CHAIN_MISMATCH,
        'Chain mismatch',
        details,
        originalError,
      );

      expect(error.code).toBe(WalletMeshErrorCode.CHAIN_MISMATCH);
      expect(error.message).toBe('Chain mismatch');
      expect(error.details).toBe(details);
      expect(error.originalError).toBe(originalError);
    });

    it('should inherit from Error correctly', () => {
      const error = new WalletMeshErrorImpl(WalletMeshErrorCode.USER_REJECTED, 'User rejected');

      expect(error instanceof Error).toBe(true);
      expect(error.toString()).toContain('WalletMeshError: User rejected');
      expect(error.stack).toBeDefined();
    });
  });

  describe('createWalletMeshError function', () => {
    it('should create WalletMeshError with minimal parameters', () => {
      const error = createWalletMeshError(WalletMeshErrorCode.WALLET_NOT_FOUND, 'Wallet not found');

      expect(isWalletMeshError(error)).toBe(true);
      expect(error.code).toBe(WalletMeshErrorCode.WALLET_NOT_FOUND);
      expect(error.message).toBe('Wallet not found');
    });

    it('should create WalletMeshError with all parameters', () => {
      const originalError = new Error('Original');
      const details = { test: 'data' };

      const error = createWalletMeshError(
        WalletMeshErrorCode.PROVIDER_ERROR,
        'Provider error',
        details,
        originalError,
      );

      expect(error.code).toBe(WalletMeshErrorCode.PROVIDER_ERROR);
      expect(error.message).toBe('Provider error');
      expect(error.details).toBe(details);
      expect(error.originalError).toBe(originalError);
    });
  });

  describe('WalletMeshErrors factory functions', () => {
    it('should create userRejected error', () => {
      const error = WalletMeshErrors.userRejected();

      expect(error.code).toBe(WalletMeshErrorCode.USER_REJECTED);
      expect(error.message).toBe('User rejected the request');
      expect(error.details).toBeUndefined();
    });

    it('should create userRejected error with details', () => {
      const details = { action: 'sign', timestamp: Date.now() };
      const error = WalletMeshErrors.userRejected(details);

      expect(error.code).toBe(WalletMeshErrorCode.USER_REJECTED);
      expect(error.details).toBe(details);
    });

    it('should create connectionFailed error', () => {
      const error = WalletMeshErrors.connectionFailed('timeout');

      expect(error.code).toBe(WalletMeshErrorCode.CONNECTION_FAILED);
      expect(error.message).toBe('Connection failed: timeout');
    });

    it('should create chainMismatch error', () => {
      const error = WalletMeshErrors.chainMismatch('1', '137');

      expect(error.code).toBe(WalletMeshErrorCode.CHAIN_MISMATCH);
      expect(error.message).toBe('Chain mismatch: expected 1, got 137');
      expect(error.details).toEqual({ expected: '1', actual: '137' });
    });

    it('should create walletNotFound error', () => {
      const error = WalletMeshErrors.walletNotFound('evm-wallet-1');

      expect(error.code).toBe(WalletMeshErrorCode.WALLET_NOT_FOUND);
      expect(error.message).toBe('Wallet not found: evm-wallet-1');
      expect(error.details).toEqual({ walletId: 'evm-wallet-1' });
    });

    it('should create walletNotInstalled error', () => {
      const error = WalletMeshErrors.walletNotInstalled('EVM Wallet 1');

      expect(error.code).toBe(WalletMeshErrorCode.WALLET_NOT_INSTALLED);
      expect(error.message).toBe('EVM Wallet 1 is not installed');
      expect(error.details).toEqual({ walletName: 'EVM Wallet 1' });
    });

    it('should create insufficientFunds error', () => {
      const error = WalletMeshErrors.insufficientFunds('1.5 ETH', '0.8 ETH');

      expect(error.code).toBe(WalletMeshErrorCode.INSUFFICIENT_FUNDS);
      expect(error.message).toBe('Insufficient funds: required 1.5 ETH, available 0.8 ETH');
      expect(error.details).toEqual({ required: '1.5 ETH', available: '0.8 ETH' });
    });

    it('should create transactionFailed error', () => {
      const error = WalletMeshErrors.transactionFailed('gas limit exceeded');

      expect(error.code).toBe(WalletMeshErrorCode.TRANSACTION_FAILED);
      expect(error.message).toBe('Transaction failed: gas limit exceeded');
      expect(error.details).toEqual({ reason: 'gas limit exceeded', txHash: undefined });
    });

    it('should create transactionFailed error with txHash', () => {
      const txHash = '0x1234...5678';
      const error = WalletMeshErrors.transactionFailed('reverted', txHash);

      expect(error.details).toEqual({ reason: 'reverted', txHash });
    });

    it('should create notConnected error', () => {
      const error = WalletMeshErrors.notConnected();

      expect(error.code).toBe(WalletMeshErrorCode.NOT_CONNECTED);
      expect(error.message).toBe('No wallet connected');
    });

    it('should create providerNotFound error', () => {
      const error = WalletMeshErrors.providerNotFound();

      expect(error.code).toBe(WalletMeshErrorCode.PROVIDER_NOT_FOUND);
      expect(error.message).toBe('No provider available');
    });
  });

  describe('isWalletMeshError type guard', () => {
    it('should return true for WalletMeshError instances', () => {
      const error = createWalletMeshError(WalletMeshErrorCode.USER_REJECTED, 'User rejected');

      expect(isWalletMeshError(error)).toBe(true);
    });

    it('should return true for WalletMeshErrorImpl instances', () => {
      const error = new WalletMeshErrorImpl(WalletMeshErrorCode.CONNECTION_FAILED, 'Connection failed');

      expect(isWalletMeshError(error)).toBe(true);
    });

    it('should return false for regular Error instances', () => {
      const error = new Error('Regular error');

      expect(isWalletMeshError(error)).toBe(false);
    });

    it('should return false for objects with invalid code', () => {
      const fakeError = {
        name: 'WalletMeshError',
        message: 'Fake error',
        code: 'INVALID_CODE',
      };

      expect(isWalletMeshError(fakeError)).toBe(false);
    });

    it('should return false for non-object values', () => {
      expect(isWalletMeshError(null)).toBe(false);
      expect(isWalletMeshError(undefined)).toBe(false);
      expect(isWalletMeshError('error string')).toBe(false);
      expect(isWalletMeshError(42)).toBe(false);
      expect(isWalletMeshError(true)).toBe(false);
    });

    it('should return false for objects without required properties', () => {
      const incompleteError = {
        message: 'Incomplete error',
        // Missing 'code' property
      };

      expect(isWalletMeshError(incompleteError)).toBe(false);
    });
  });

  describe('getErrorMessage helper', () => {
    it('should return message from WalletMeshError', () => {
      const error = createWalletMeshError(
        WalletMeshErrorCode.WALLET_NOT_FOUND,
        'Custom wallet error message',
      );

      const message = getErrorMessage(error);
      expect(message).toBe('Custom wallet error message');
    });

    it('should return message from regular Error', () => {
      const error = new Error('Regular error message');

      const message = getErrorMessage(error);
      expect(message).toBe('Regular error message');
    });

    it('should return default message for non-Error values', () => {
      expect(getErrorMessage(null)).toBe('An unknown error occurred');
      expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
      expect(getErrorMessage('string error')).toBe('An unknown error occurred');
      expect(getErrorMessage(42)).toBe('An unknown error occurred');
      expect(getErrorMessage({})).toBe('An unknown error occurred');
    });

    it('should handle Error-like objects without instanceof check', () => {
      const errorLike = {
        message: 'Error-like message',
        name: 'CustomError',
      };

      const message = getErrorMessage(errorLike);
      expect(message).toBe('An unknown error occurred');
    });
  });

  describe('isRecoverableError helper', () => {
    it('should return true for recoverable error codes', () => {
      const recoverableErrors = [
        WalletMeshErrorCode.CONNECTION_TIMEOUT,
        WalletMeshErrorCode.CHAIN_MISMATCH,
        WalletMeshErrorCode.WALLET_LOCKED,
        WalletMeshErrorCode.GAS_ESTIMATION_FAILED,
      ];

      for (const code of recoverableErrors) {
        const error = createWalletMeshError(code, 'Test error');
        expect(isRecoverableError(error)).toBe(true);
      }
    });

    it('should return false for non-recoverable error codes', () => {
      const nonRecoverableErrors = [
        WalletMeshErrorCode.USER_REJECTED,
        WalletMeshErrorCode.USER_CANCELLED,
        WalletMeshErrorCode.WALLET_NOT_FOUND,
        WalletMeshErrorCode.WALLET_NOT_INSTALLED,
        WalletMeshErrorCode.INSUFFICIENT_FUNDS,
        WalletMeshErrorCode.TRANSACTION_REJECTED,
        WalletMeshErrorCode.UNKNOWN_ERROR,
      ];

      for (const code of nonRecoverableErrors) {
        const error = createWalletMeshError(code, 'Test error');
        expect(isRecoverableError(error)).toBe(false);
      }
    });

    it('should return false for non-WalletMeshError instances', () => {
      const error = new Error('Regular error');
      expect(isRecoverableError(error)).toBe(false);

      expect(isRecoverableError(null)).toBe(false);
      expect(isRecoverableError(undefined)).toBe(false);
      expect(isRecoverableError('string')).toBe(false);
    });
  });

  describe('Error factories integration', () => {
    it('should create errors that pass all type guards', () => {
      const factories = [
        () => WalletMeshErrors.userRejected(),
        () => WalletMeshErrors.connectionFailed('test'),
        () => WalletMeshErrors.chainMismatch('1', '137'),
        () => WalletMeshErrors.walletNotFound('evm-wallet-1'),
        () => WalletMeshErrors.walletNotInstalled('EVM Wallet 1'),
        () => WalletMeshErrors.insufficientFunds('1 ETH', '0.5 ETH'),
        () => WalletMeshErrors.transactionFailed('test'),
        () => WalletMeshErrors.notConnected(),
        () => WalletMeshErrors.providerNotFound(),
      ];

      for (const factory of factories) {
        const error = factory();
        expect(isWalletMeshError(error)).toBe(true);
        expect(getErrorMessage(error)).toBeTruthy();
        expect(typeof isRecoverableError(error)).toBe('boolean');
      }
    });
  });

  describe('Real-world usage scenarios', () => {
    it('should handle wallet connection error flow', () => {
      // Simulate wallet connection attempt
      const walletId = 'evm-wallet-1';

      // Wallet not found
      let error = WalletMeshErrors.walletNotFound(walletId);
      expect(isWalletMeshError(error)).toBe(true);
      expect(isRecoverableError(error)).toBe(false);

      // Connection timeout (recoverable)
      error = createWalletMeshError(WalletMeshErrorCode.CONNECTION_TIMEOUT, 'Connection timed out');
      expect(isRecoverableError(error)).toBe(true);

      // User rejection (not recoverable)
      error = WalletMeshErrors.userRejected({ action: 'connect' });
      expect(isRecoverableError(error)).toBe(false);
    });

    it('should handle transaction error flow', () => {
      // Insufficient funds
      let error = WalletMeshErrors.insufficientFunds('1.5 ETH', '0.8 ETH');
      expect(error.details).toEqual({ required: '1.5 ETH', available: '0.8 ETH' });
      expect(isRecoverableError(error)).toBe(false);

      // Gas estimation failed (recoverable)
      error = createWalletMeshError(WalletMeshErrorCode.GAS_ESTIMATION_FAILED, 'Gas estimation failed');
      expect(isRecoverableError(error)).toBe(true);

      // Transaction failed
      const txHash = '0xabcd1234';
      error = WalletMeshErrors.transactionFailed('reverted', txHash);
      expect(error.details).toEqual({ reason: 'reverted', txHash });
    });

    it('should handle chain switching error flow', () => {
      // Chain mismatch (recoverable)
      const error = WalletMeshErrors.chainMismatch('1', '137');
      expect(isRecoverableError(error)).toBe(true);
      expect(error.details).toEqual({ expected: '1', actual: '137' });

      // Error message extraction
      const message = getErrorMessage(error);
      expect(message).toBe('Chain mismatch: expected 1, got 137');
    });
  });
});
