/**
 * Tests for Solana Provider Types
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestEnvironment, installCustomMatchers } from '../../testing/index.js';
import {
  type PublicKey,
  type SignAndSendTransactionOptions,
  type SolanaConnectOptions,
  type SolanaProvider,
  type SolanaProviderState,
  type SolanaSignInInput,
  type SolanaSignInOutput,
  type SolanaTransaction,
  type SolanaWalletCapabilities,
  type SolanaWalletFeature,
  WalletAccountError,
  WalletConnectionError,
  WalletDisconnectedError,
  WalletError,
  WalletNotConnectedError,
  WalletPublicKeyError,
  WalletSendTransactionError,
  WalletSignMessageError,
  WalletSignTransactionError,
  createMockPublicKey,
  isSolanaProvider,
  isSolanaWalletError,
  walletSupportsFeature,
} from './SolanaProvider.js';

// Install domain-specific matchers
installCustomMatchers();

describe('Solana Provider Types', () => {
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });
  describe('isSolanaProvider', () => {
    it('should return true for valid Solana provider', () => {
      const mockProvider = {
        name: 'Test Wallet',
        icon: 'test.png',
        publicKey: null,
        connected: false,
        readyState: 'Installed' as const,
        connect: () => Promise.resolve({ publicKey: createMockPublicKey('test') }),
        disconnect: () => Promise.resolve(),
        signTransaction: <T extends SolanaTransaction>(tx: T) => Promise.resolve(tx),
        signAllTransactions: <T extends SolanaTransaction>(txs: T[]) => Promise.resolve(txs),
        signAndSendTransaction: () => Promise.resolve({ signature: 'test' }),
        signMessage: () => Promise.resolve({ signature: new Uint8Array() }),
        on: () => {},
        once: () => {},
        removeListener: () => {},
        off: () => {},
        emit: () => true,
        getCapabilities: () => Promise.resolve({}),
        getState: () => Promise.resolve({} as SolanaProviderState),
        isWalletMesh: true as const,
        providerType: 'solana' as const,
      };

      expect(isSolanaProvider(mockProvider)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isSolanaProvider(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isSolanaProvider(undefined)).toBe(false);
    });

    it('should return false for objects without connect method', () => {
      const invalidProvider = {
        disconnect: () => Promise.resolve(),
        signTransaction: () => Promise.resolve({}),
      };
      expect(isSolanaProvider(invalidProvider)).toBe(false);
    });

    it('should return false for objects without disconnect method', () => {
      const invalidProvider = {
        connect: () => Promise.resolve({}),
        signTransaction: () => Promise.resolve({}),
      };
      expect(isSolanaProvider(invalidProvider)).toBe(false);
    });

    it('should return false for objects without signTransaction method', () => {
      const invalidProvider = {
        connect: () => Promise.resolve({}),
        disconnect: () => Promise.resolve(),
      };
      expect(isSolanaProvider(invalidProvider)).toBe(false);
    });

    it('should return false for objects with invalid method types', () => {
      const invalidProvider = {
        connect: 'not a function',
        disconnect: () => Promise.resolve(),
        signTransaction: () => Promise.resolve({}),
      };
      expect(isSolanaProvider(invalidProvider)).toBe(false);
    });

    it('should return false for primitive values', () => {
      expect(isSolanaProvider('string')).toBe(false);
      expect(isSolanaProvider(123)).toBe(false);
      expect(isSolanaProvider(true)).toBe(false);
    });
  });

  describe('Wallet Error Classes', () => {
    describe('WalletError', () => {
      it('should create base wallet error', () => {
        const error = new WalletError('Test error', { detail: 'info' });
        expect(error.message).toBe('Test error');
        expect(error.error).toEqual({ detail: 'info' });
        expect(error instanceof Error).toBe(true);
      });

      it('should create wallet error without additional error data', () => {
        const error = new WalletError('Test error');
        expect(error.message).toBe('Test error');
        expect(error.error).toBeUndefined();
      });
    });

    describe('WalletConnectionError', () => {
      it('should create connection error with correct name', () => {
        const error = new WalletConnectionError('Connection failed');
        expect(error.name).toBe('WalletConnectionError');
        expect(error.message).toBe('Connection failed');
        expect(error instanceof WalletError).toBe(true);
      });
    });

    describe('WalletDisconnectedError', () => {
      it('should create disconnected error with correct name', () => {
        const error = new WalletDisconnectedError('Wallet disconnected');
        expect(error.name).toBe('WalletDisconnectedError');
        expect(error.message).toBe('Wallet disconnected');
        expect(error instanceof WalletError).toBe(true);
      });
    });

    describe('WalletAccountError', () => {
      it('should create account error with correct name', () => {
        const error = new WalletAccountError('Account error');
        expect(error.name).toBe('WalletAccountError');
        expect(error.message).toBe('Account error');
        expect(error instanceof WalletError).toBe(true);
      });
    });

    describe('WalletPublicKeyError', () => {
      it('should create public key error with correct name', () => {
        const error = new WalletPublicKeyError('Public key error');
        expect(error.name).toBe('WalletPublicKeyError');
        expect(error.message).toBe('Public key error');
        expect(error instanceof WalletError).toBe(true);
      });
    });

    describe('WalletNotConnectedError', () => {
      it('should create not connected error with correct name', () => {
        const error = new WalletNotConnectedError('Not connected');
        expect(error.name).toBe('WalletNotConnectedError');
        expect(error.message).toBe('Not connected');
        expect(error instanceof WalletError).toBe(true);
      });
    });

    describe('WalletSendTransactionError', () => {
      it('should create send transaction error with correct name', () => {
        const error = new WalletSendTransactionError('Send failed');
        expect(error.name).toBe('WalletSendTransactionError');
        expect(error.message).toBe('Send failed');
        expect(error instanceof WalletError).toBe(true);
      });
    });

    describe('WalletSignTransactionError', () => {
      it('should create sign transaction error with correct name', () => {
        const error = new WalletSignTransactionError('Sign failed');
        expect(error.name).toBe('WalletSignTransactionError');
        expect(error.message).toBe('Sign failed');
        expect(error instanceof WalletError).toBe(true);
      });
    });

    describe('WalletSignMessageError', () => {
      it('should create sign message error with correct name', () => {
        const error = new WalletSignMessageError('Sign message failed');
        expect(error.name).toBe('WalletSignMessageError');
        expect(error.message).toBe('Sign message failed');
        expect(error instanceof WalletError).toBe(true);
      });
    });
  });

  describe('isSolanaWalletError', () => {
    it('should return true for WalletError instances', () => {
      const error = new WalletError('Test error');
      expect(isSolanaWalletError(error)).toBe(true);
    });

    it('should return true for specific wallet error types', () => {
      expect(isSolanaWalletError(new WalletConnectionError('Connection failed'))).toBe(true);
      expect(isSolanaWalletError(new WalletDisconnectedError('Disconnected'))).toBe(true);
      expect(isSolanaWalletError(new WalletAccountError('Account error'))).toBe(true);
      expect(isSolanaWalletError(new WalletPublicKeyError('Public key error'))).toBe(true);
      expect(isSolanaWalletError(new WalletNotConnectedError('Not connected'))).toBe(true);
      expect(isSolanaWalletError(new WalletSendTransactionError('Send failed'))).toBe(true);
      expect(isSolanaWalletError(new WalletSignTransactionError('Sign failed'))).toBe(true);
      expect(isSolanaWalletError(new WalletSignMessageError('Sign message failed'))).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Regular error');
      expect(isSolanaWalletError(error)).toBe(false);
    });

    it('should return false for non-Error objects', () => {
      expect(isSolanaWalletError({ message: 'Not an error' })).toBe(false);
      expect(isSolanaWalletError(null)).toBe(false);
      expect(isSolanaWalletError(undefined)).toBe(false);
      expect(isSolanaWalletError('string')).toBe(false);
      expect(isSolanaWalletError(123)).toBe(false);
    });
  });

  describe('walletSupportsFeature', () => {
    it('should return true when feature is supported', () => {
      const capabilities: SolanaWalletCapabilities = {
        features: ['solana:signTransaction', 'solana:signMessage', 'standard:connect'],
      };

      expect(walletSupportsFeature(capabilities, 'solana:signTransaction')).toBe(true);
      expect(walletSupportsFeature(capabilities, 'solana:signMessage')).toBe(true);
      expect(walletSupportsFeature(capabilities, 'standard:connect')).toBe(true);
    });

    it('should return false when feature is not supported', () => {
      const capabilities: SolanaWalletCapabilities = {
        features: ['solana:signTransaction'],
      };

      expect(walletSupportsFeature(capabilities, 'solana:signMessage')).toBe(false);
      expect(walletSupportsFeature(capabilities, 'standard:connect')).toBe(false);
    });

    it('should return false when capabilities has no features', () => {
      const capabilities: SolanaWalletCapabilities = {};

      expect(walletSupportsFeature(capabilities, 'solana:signTransaction')).toBe(false);
    });

    it('should return false when capabilities features is empty array', () => {
      const capabilities: SolanaWalletCapabilities = {
        features: [],
      };

      expect(walletSupportsFeature(capabilities, 'solana:signTransaction')).toBe(false);
    });
  });

  describe('createMockPublicKey', () => {
    it('should create a valid PublicKey mock', () => {
      const address = '11111111111111111111111111111112';
      const publicKey = createMockPublicKey(address);

      expect(publicKey.toBase58()).toBe(address);
      expect(publicKey.toString()).toBe(address);
      expect(publicKey.toBuffer()).toEqual(Buffer.from(address));
      expect(publicKey.toBytes()).toEqual(new Uint8Array(Buffer.from(address)));
    });

    it('should handle equals method correctly', () => {
      const address1 = '11111111111111111111111111111112';
      const address2 = '11111111111111111111111111111113';

      const publicKey1 = createMockPublicKey(address1);
      const publicKey2 = createMockPublicKey(address1);
      const publicKey3 = createMockPublicKey(address2);

      expect(publicKey1.equals(publicKey2)).toBe(true);
      expect(publicKey1.equals(publicKey3)).toBe(false);
    });
  });

  describe('Type definitions', () => {
    it('should properly type SolanaConnectOptions', () => {
      const connectOptions: SolanaConnectOptions = {
        onlyIfTrusted: true,
        silent: false,
        timeout: 30000,
      };

      expect(connectOptions.onlyIfTrusted).toBe(true);
      expect(connectOptions.silent).toBe(false);
      expect(connectOptions.timeout).toBe(30000);
    });

    it('should properly type SolanaProviderState', () => {
      const providerState: SolanaProviderState = {
        publicKey: '11111111111111111111111111111112',
        isConnected: true,
        cluster: 'mainnet-beta',
        capabilities: {
          supportedTransactionVersions: ['legacy', 0],
          maxTransactionsPerRequest: 10,
          features: ['solana:signTransaction'],
        },
      };

      expect(providerState.publicKey).toBe('11111111111111111111111111111112');
      expect(providerState.isConnected).toBe(true);
      expect(providerState.cluster).toBe('mainnet-beta');
      expect(providerState.capabilities.maxTransactionsPerRequest).toBe(10);
    });

    it('should properly type SignAndSendTransactionOptions', () => {
      const options: SignAndSendTransactionOptions = {
        commitment: 'confirmed',
        skipPreflight: false,
        maxRetries: 3,
        waitForConfirmation: true,
      };

      expect(options.commitment).toBe('confirmed');
      expect(options.skipPreflight).toBe(false);
      expect(options.maxRetries).toBe(3);
      expect(options.waitForConfirmation).toBe(true);
    });

    it('should properly type SolanaSignInInput', () => {
      const signInInput: SolanaSignInInput = {
        domain: 'example.com',
        statement: 'Sign in to Example App',
        uri: 'https://example.com',
        version: '1',
        chainId: 'mainnet',
        nonce: 'random-nonce',
        issuedAt: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 3600000).toISOString(),
        notBefore: new Date().toISOString(),
        requestId: 'request-123',
        resources: ['https://api.example.com'],
      };

      expect(signInInput.domain).toBe('example.com');
      expect(signInInput.statement).toBe('Sign in to Example App');
      expect(signInInput.chainId).toBe('mainnet');
      expect(signInInput.resources).toContain('https://api.example.com');
    });

    it('should properly type SolanaSignInOutput', () => {
      const signInOutput: SolanaSignInOutput = {
        signature: new Uint8Array([1, 2, 3]),
        signedMessage: new Uint8Array([4, 5, 6]),
        account: {
          address: '11111111111111111111111111111112',
          publicKey: new Uint8Array([7, 8, 9]),
          chains: ['solana:mainnet'],
          features: ['solana:signIn'],
        },
      };

      expect(signInOutput.signature).toEqual(new Uint8Array([1, 2, 3]));
      expect(signInOutput.signedMessage).toEqual(new Uint8Array([4, 5, 6]));
      expect(signInOutput.account.address).toBe('11111111111111111111111111111112');
      expect(signInOutput.account.chains).toContain('solana:mainnet');
    });

    it('should properly type SolanaWalletCapabilities', () => {
      const capabilities: SolanaWalletCapabilities = {
        supportedTransactionVersions: ['legacy', 0],
        maxTransactionsPerRequest: 5,
        maxMessagesPerRequest: 3,
        features: [
          'solana:signTransaction',
          'solana:signAllTransactions',
          'solana:signAndSendTransaction',
          'solana:signMessage',
          'solana:signIn',
          'standard:connect',
          'standard:disconnect',
          'standard:events',
        ],
      };

      expect(capabilities.supportedTransactionVersions).toEqual(['legacy', 0]);
      expect(capabilities.maxTransactionsPerRequest).toBe(5);
      expect(capabilities.maxMessagesPerRequest).toBe(3);
      expect(capabilities.features).toHaveLength(8);
      expect(capabilities.features).toContain('solana:signTransaction');
      expect(capabilities.features).toContain('standard:connect');
    });
  });
});
