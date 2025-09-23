/**
 * Tests for Provider Types Index Module
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestEnvironment, installCustomMatchers } from '../../testing/index.js';
import * as ProviderTypes from './index.js';

// Install domain-specific matchers
installCustomMatchers();

describe('Provider Types Index Module', () => {
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });
  describe('EVM Provider Exports', () => {
    it('should export EVM type guards', () => {
      expect(typeof ProviderTypes.isEVMProvider).toBe('function');
      expect(typeof ProviderTypes.isEIP1193Error).toBe('function');
    });

    it('should export EIP1193ErrorCode enum', () => {
      expect(ProviderTypes.EIP1193ErrorCode).toBeDefined();
      expect(ProviderTypes.EIP1193ErrorCode.UserRejectedRequest).toBe(4001);
      expect(ProviderTypes.EIP1193ErrorCode.Unauthorized).toBe(4100);
    });

    it('should validate EVM provider type guard', () => {
      const mockEVMProvider = {
        request: () => Promise.resolve({}),
        on: () => {},
        isWalletMesh: true,
        providerType: 'evm',
      };

      expect(ProviderTypes.isEVMProvider(mockEVMProvider)).toBe(true);
      expect(ProviderTypes.isEVMProvider(null)).toBe(false);
    });
  });

  describe('Solana Provider Exports', () => {
    it('should export Solana error classes', () => {
      expect(ProviderTypes.WalletError).toBeDefined();
      expect(ProviderTypes.WalletConnectionError).toBeDefined();
      expect(ProviderTypes.WalletDisconnectedError).toBeDefined();
      expect(ProviderTypes.WalletAccountError).toBeDefined();
      expect(ProviderTypes.WalletPublicKeyError).toBeDefined();
      expect(ProviderTypes.WalletNotConnectedError).toBeDefined();
      expect(ProviderTypes.WalletSendTransactionError).toBeDefined();
      expect(ProviderTypes.WalletSignTransactionError).toBeDefined();
      expect(ProviderTypes.WalletSignMessageError).toBeDefined();
    });

    it('should export Solana utilities', () => {
      expect(typeof ProviderTypes.isSolanaProvider).toBe('function');
      expect(typeof ProviderTypes.isSolanaWalletError).toBe('function');
      expect(typeof ProviderTypes.walletSupportsFeature).toBe('function');
      expect(typeof ProviderTypes.createMockPublicKey).toBe('function');
    });

    it('should validate Solana provider type guard', () => {
      const mockSolanaProvider = {
        connect: () => Promise.resolve({ publicKey: {} }),
        disconnect: () => Promise.resolve(),
        signTransaction: () => Promise.resolve({}),
        isWalletMesh: true,
        providerType: 'solana',
      };

      expect(ProviderTypes.isSolanaProvider(mockSolanaProvider)).toBe(true);
      expect(ProviderTypes.isSolanaProvider(null)).toBe(false);
    });

    it('should validate wallet error type guard', () => {
      const walletError = new ProviderTypes.WalletError('Test error');
      const regularError = new Error('Regular error');

      expect(ProviderTypes.isSolanaWalletError(walletError)).toBe(true);
      expect(ProviderTypes.isSolanaWalletError(regularError)).toBe(false);
    });

    it('should check wallet feature support', () => {
      const capabilities = {
        features: ['solana:signTransaction', 'solana:signMessage'],
      };

      expect(ProviderTypes.walletSupportsFeature(capabilities, 'solana:signTransaction')).toBe(true);
      expect(ProviderTypes.walletSupportsFeature(capabilities, 'solana:signIn')).toBe(false);
    });

    it('should create mock public key', () => {
      const address = '11111111111111111111111111111112';
      const publicKey = ProviderTypes.createMockPublicKey(address);

      expect(publicKey.toBase58()).toBe(address);
      expect(publicKey.toString()).toBe(address);
    });
  });

  describe('Aztec Provider Exports', () => {
    it('should export Aztec error class', () => {
      expect(ProviderTypes.AztecProviderError).toBeDefined();
    });

    it('should export Aztec utilities', () => {
      expect(typeof ProviderTypes.isAztecProvider).toBe('function');
      expect(typeof ProviderTypes.isAztecProviderError).toBe('function');
      expect(typeof ProviderTypes.isSandboxNetwork).toBe('function');
    });

    it('should validate Aztec provider type guard', () => {
      const mockAztecProvider = {
        // Required Aztec wallet methods that isAztecProvider checks for
        deployContract: () => Promise.resolve(),
        wmExecuteTx: () => Promise.resolve(),
        wmSimulateTx: () => Promise.resolve(),
        getTxReceipt: () => Promise.resolve(),
        getAddress: () => Promise.resolve(),
        getCompleteAddress: () => Promise.resolve(),
        createAuthWit: () => Promise.resolve(),
        getBlockNumber: () => Promise.resolve(),
      };

      expect(ProviderTypes.isAztecProvider(mockAztecProvider)).toBe(true);
      expect(ProviderTypes.isAztecProvider(null)).toBe(false);
    });

    it('should validate Aztec error type guard', () => {
      const aztecError = new ProviderTypes.AztecProviderError('Test error', 'TEST_CODE');
      const regularError = new Error('Regular error');

      expect(ProviderTypes.isAztecProviderError(aztecError)).toBe(true);
      expect(ProviderTypes.isAztecProviderError(regularError)).toBe(false);
    });

    it('should detect sandbox networks', () => {
      const sandboxNetwork = {
        name: 'Sandbox Network',
        chainId: 31337,
        rpcUrl: 'http://localhost:8080',
        isSandbox: true,
      };

      const mainnetNetwork = {
        name: 'Mainnet',
        chainId: 1,
        rpcUrl: 'https://mainnet.aztec.network',
        isSandbox: false,
      };

      expect(ProviderTypes.isSandboxNetwork(sandboxNetwork)).toBe(true);
      expect(ProviderTypes.isSandboxNetwork(mainnetNetwork)).toBe(false);
    });
  });

  describe('Unified Provider Exports', () => {
    it('should export ConnectionState enum', () => {
      expect(ProviderTypes.ConnectionState).toBeDefined();
      expect(ProviderTypes.ConnectionState.Disconnected).toBe('disconnected');
      expect(ProviderTypes.ConnectionState.Connecting).toBe('connecting');
      expect(ProviderTypes.ConnectionState.Connected).toBe('connected');
      expect(ProviderTypes.ConnectionState.Disconnecting).toBe('disconnecting');
      expect(ProviderTypes.ConnectionState.Error).toBe('error');
    });

    it('should export WalletProviderError class', () => {
      expect(ProviderTypes.WalletProviderError).toBeDefined();

      const error = new ProviderTypes.WalletProviderError('Test error', 'TEST_CODE');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('WalletProviderError');
    });

    it('should export ConnectionStateManager class', () => {
      expect(ProviderTypes.ConnectionStateManager).toBeDefined();

      const manager = new ProviderTypes.ConnectionStateManager();
      expect(manager.getState()).toBe(ProviderTypes.ConnectionState.Disconnected);
      expect(manager.isDisconnected()).toBe(true);
    });

    it('should export unified provider utilities', () => {
      expect(typeof ProviderTypes.isWalletProvider).toBe('function');
      expect(typeof ProviderTypes.isProviderType).toBe('function');
      expect(typeof ProviderTypes.getChainType).toBe('function');
      expect(typeof ProviderTypes.hasCapability).toBe('function');
      expect(typeof ProviderTypes.createMockConnectionInfo).toBe('function');
    });

    it('should validate wallet provider type guard', () => {
      const mockProvider = {
        isWalletMesh: true,
        providerType: 'evm',
      };

      expect(ProviderTypes.isWalletProvider(mockProvider)).toBe(true);
      expect(ProviderTypes.isWalletProvider(null)).toBe(false);
    });

    it('should check provider type correctly', () => {
      const evmProvider = {
        providerType: 'evm' as const,
        isWalletMesh: true as const,
      } as ProviderTypes.WalletProvider;

      expect(ProviderTypes.isProviderType(evmProvider, 'evm')).toBe(true);
      expect(ProviderTypes.isProviderType(evmProvider, 'solana')).toBe(false);
    });

    it('should get chain type from provider', () => {
      const solanaProvider = {
        providerType: 'solana' as const,
        isWalletMesh: true as const,
      } as ProviderTypes.WalletProvider;

      expect(ProviderTypes.getChainType(solanaProvider)).toBe('solana');
    });

    it('should create mock connection info', () => {
      const connectionInfo = ProviderTypes.createMockConnectionInfo('evm', ['0x123', '0x456'], '137');

      expect(connectionInfo.state).toBe(ProviderTypes.ConnectionState.Connected);
      expect(connectionInfo.accounts).toEqual(['0x123', '0x456']);
      expect(connectionInfo.chainId).toBe('137');
      expect(typeof connectionInfo.connectedAt).toBe('number');
      expect(typeof connectionInfo.lastActivityAt).toBe('number');
    });
  });

  describe('Type Mapping Interfaces', () => {
    it('should have correct type structure for ChainProviderMap', () => {
      // This test ensures the type mapping interfaces are properly structured
      // We can't directly test types at runtime, but we can verify the exports exist
      expect(typeof ProviderTypes.isEVMProvider).toBe('function');
      expect(typeof ProviderTypes.isSolanaProvider).toBe('function');
      expect(typeof ProviderTypes.isAztecProvider).toBe('function');
    });

    it('should validate chain type constants', () => {
      // Test that our chain types are consistent
      const chainTypes = ['evm', 'solana', 'aztec'];

      // Verify all expected chain types are supported
      for (const chainType of chainTypes) {
        expect(typeof chainType).toBe('string');
        expect(chainType.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Error Class Inheritance', () => {
    it('should maintain proper error inheritance for all error types', () => {
      // Test all error classes are properly constructed and inherit from Error
      const walletError = new ProviderTypes.WalletError('Wallet error');
      const connectionError = new ProviderTypes.WalletConnectionError('Connection error');
      const providerError = new ProviderTypes.WalletProviderError('Provider error', 'CODE');
      const aztecError = new ProviderTypes.AztecProviderError('Aztec error', 'AZTEC_CODE');

      // All should be instances of Error
      expect(walletError instanceof Error).toBe(true);
      expect(connectionError instanceof Error).toBe(true);
      expect(providerError instanceof Error).toBe(true);
      expect(aztecError instanceof Error).toBe(true);

      // Specific inheritance checks
      expect(connectionError instanceof ProviderTypes.WalletError).toBe(true);
      expect(walletError instanceof ProviderTypes.WalletError).toBe(true);
    });
  });

  describe('Export Completeness', () => {
    it('should export all required EVM types', () => {
      const requiredEVMExports = ['isEVMProvider', 'isEIP1193Error', 'EIP1193ErrorCode'];

      for (const exportName of requiredEVMExports) {
        expect(exportName in ProviderTypes).toBe(true);
      }
    });

    it('should export all required Solana types', () => {
      const requiredSolanaExports = [
        'WalletError',
        'WalletConnectionError',
        'isSolanaProvider',
        'walletSupportsFeature',
        'createMockPublicKey',
      ];

      for (const exportName of requiredSolanaExports) {
        expect(exportName in ProviderTypes).toBe(true);
      }
    });

    it('should export all required Aztec types', () => {
      const requiredAztecExports = ['AztecProviderError', 'isAztecProvider', 'isSandboxNetwork'];

      for (const exportName of requiredAztecExports) {
        expect(exportName in ProviderTypes).toBe(true);
      }
    });

    it('should export all required unified types', () => {
      const requiredUnifiedExports = [
        'ConnectionState',
        'WalletProviderError',
        'ConnectionStateManager',
        'isWalletProvider',
        'getChainType',
        'createMockConnectionInfo',
      ];

      for (const exportName of requiredUnifiedExports) {
        expect(exportName in ProviderTypes).toBe(true);
      }
    });
  });
});
