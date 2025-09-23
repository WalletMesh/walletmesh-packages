/**
 * Tests for modalFactory.ts
 * @internal
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockClient,
  // createMockFrameworkAdapter, // Framework adapters removed
  createMockLogger,
  setupMocks,
} from '../../testing/index.js';
import { ChainType } from '../../types.js';
import type { WalletInfo } from '../../types.js';
import { ModalController } from '../modal/controller.js';
import {
  type ModalFactoryConfig,
  type TestModalConfig,
  createModalController,
  createTestModal,
} from './modalFactory.js';

// Setup centralized mocks
setupMocks.modalController();
setupMocks.serviceFactories();

describe('modalFactory', () => {
  let mockWallets: WalletInfo[];
  let mockClient: ReturnType<typeof createMockClient>;
  // let mockFrameworkAdapter: ReturnType<typeof createMockFrameworkAdapter>; // Framework adapters removed

  beforeEach(() => {
    vi.clearAllMocks();

    mockWallets = [
      {
        id: 'test-wallet',
        name: 'Test Wallet',
        icon: 'data:image/svg+xml,<svg></svg>',
        chains: [ChainType.Evm],
      },
    ];

    mockClient = createMockClient();
    // mockFrameworkAdapter = createMockFrameworkAdapter(); // Framework adapters removed
  });

  describe('createModalController', () => {
    it('should create modal controller with minimal config', () => {
      const config: ModalFactoryConfig = {
        wallets: mockWallets,
        client: mockClient,
        // frameworkAdapter: removed
      };

      const controller = createModalController(config);

      expect(ModalController).toHaveBeenCalledWith(
        expect.objectContaining({
          wallets: mockWallets,
          client: mockClient,
          // frameworkAdapter: removed
        }),
      );
      expect(controller).toBeDefined();
    });

    it('should create modal controller with full config', () => {
      const config: ModalFactoryConfig = {
        wallets: mockWallets,
        client: mockClient,
        // frameworkAdapter: removed
        supportedChains: [{ chainId: '1', chainType: 'evm', required: true, label: 'Ethereum' }],
        initialView: 'connecting',
        autoCloseDelay: 5000,
        persistWalletSelection: true,
        showProviderSelection: true,
        debug: true,
      };

      const controller = createModalController(config);

      expect(ModalController).toHaveBeenCalledWith(
        expect.objectContaining({
          wallets: mockWallets,
          client: mockClient,
          // frameworkAdapter: removed
          supportedChains: {
            chainsByTech: {
              evm: [{ chainId: '1', chainType: 'evm', required: true, label: 'Ethereum' }],
            },
            allowMultipleWalletsPerChain: false,
            allowFallbackChains: false,
          },
          initialView: 'connecting',
          autoCloseDelay: 5000,
          persistWalletSelection: true,
          showProviderSelection: true,
          debug: true,
        }),
      );
      expect(controller).toBeDefined();
    });

    it('should handle optional config properties correctly', () => {
      const configWithPartialOptions: ModalFactoryConfig = {
        wallets: mockWallets,
        client: mockClient,
        // frameworkAdapter: removed
        debug: false,
      };

      const controller = createModalController(configWithPartialOptions);

      expect(ModalController).toHaveBeenCalledWith(
        expect.objectContaining({
          wallets: mockWallets,
          client: mockClient,
          // frameworkAdapter: removed
          debug: false,
        }),
      );
      expect(controller).toBeDefined();
    });

    it('should handle configuration without theme', () => {
      const config: ModalFactoryConfig = {
        wallets: mockWallets,
        client: mockClient,
        // frameworkAdapter: removed
      };

      const controller = createModalController(config);

      expect(ModalController).toHaveBeenCalledWith(
        expect.objectContaining({
          wallets: mockWallets,
          client: mockClient,
          // frameworkAdapter: removed
        }),
      );
      expect(controller).toBeDefined();
    });

    it('should exclude undefined optional properties from controller options', () => {
      const config: ModalFactoryConfig = {
        wallets: mockWallets,
        client: mockClient,
        // frameworkAdapter: removed
        // Optional properties omitted to test undefined handling
      };

      const controller = createModalController(config);

      // Get the actual call arguments
      const calls = vi.mocked(ModalController).mock.calls;
      const lastCall = calls[calls.length - 1];
      const options = lastCall?.[0];

      // Verify undefined properties are not included
      expect(options).not.toHaveProperty('supportedChains');
      expect(options).not.toHaveProperty('initialView');
      expect(options).not.toHaveProperty('autoCloseDelay');
      expect(options).not.toHaveProperty('persistWalletSelection');
      expect(options).not.toHaveProperty('showProviderSelection');
      expect(options).not.toHaveProperty('debug');

      expect(controller).toBeDefined();
    });

    it('should include zero and false values in controller options', () => {
      const config: ModalFactoryConfig = {
        wallets: mockWallets,
        client: mockClient,
        // frameworkAdapter: removed
        autoCloseDelay: 0,
        persistWalletSelection: false,
        showProviderSelection: false,
        debug: false,
      };

      const controller = createModalController(config);

      expect(ModalController).toHaveBeenCalledWith(
        expect.objectContaining({
          autoCloseDelay: 0,
          persistWalletSelection: false,
          showProviderSelection: false,
          debug: false,
        }),
      );
      expect(controller).toBeDefined();
    });
  });

  describe('createTestModal', () => {
    it('should create test modal with default configuration', () => {
      const controller = createTestModal();

      expect(ModalController).toHaveBeenCalledWith(
        expect.objectContaining({
          wallets: expect.arrayContaining([
            expect.objectContaining({
              id: 'debug-wallet',
              name: 'Debug Wallet',
              icon: 'data:image/svg+xml,<svg></svg>',
              chains: [ChainType.Evm],
            }),
          ]),
          client: expect.objectContaining({
            connect: expect.any(Function),
            disconnect: expect.any(Function),
            disconnectAll: expect.any(Function),
            switchChain: expect.any(Function),
            getConnection: expect.any(Function),
            getConnections: expect.any(Function),
            getAllConnections: expect.any(Function),
            discoverWallets: expect.any(Function),
            closeModal: expect.any(Function),
            destroy: expect.any(Function),
            getActiveWallet: expect.any(Function),
            getAllWallets: expect.any(Function),
          }),
          debug: true,
        }),
      );
      expect(controller).toBeDefined();
    });

    it('should create test modal with custom config', () => {
      const customWallets: WalletInfo[] = [
        {
          id: 'custom-wallet',
          name: 'Custom Test Wallet',
          icon: 'data:image/svg+xml,<svg>custom</svg>',
          chains: [ChainType.Solana],
        },
      ];

      const config: TestModalConfig = {
        wallets: customWallets,
        client: mockClient,
        // frameworkAdapter: removed
      };

      const controller = createTestModal(config);

      expect(ModalController).toHaveBeenCalledWith(
        expect.objectContaining({
          wallets: customWallets,
          client: mockClient,
          // frameworkAdapter: removed
          debug: true,
        }),
      );
      expect(controller).toBeDefined();
    });

    it('should create mock client when none provided', () => {
      const controller = createTestModal({});

      expect(ModalController).toHaveBeenCalledWith(
        expect.objectContaining({
          client: expect.objectContaining({
            connect: expect.any(Function),
            disconnect: expect.any(Function),
            disconnectAll: expect.any(Function),
            getConnection: expect.any(Function),
            getConnections: expect.any(Function),
            getAllConnections: expect.any(Function),
            discoverWallets: expect.any(Function),
            getWallet: expect.any(Function),
            getAllWallets: expect.any(Function),
            on: expect.any(Function),
            openModal: expect.any(Function),
            closeModal: expect.any(Function),
            isConnected: expect.any(Boolean),
            destroy: expect.any(Function),
          }),
        }),
      );
      expect(controller).toBeDefined();
    });

    // Framework adapters removed from modal-core
  });

  describe('mock functions', () => {
    it('should create working mock client', async () => {
      createTestModal({});

      // Get the client from the call
      const calls = vi.mocked(ModalController).mock.calls;
      const lastCall = calls[calls.length - 1];
      const client = lastCall?.[0].client;

      // Test mock client functionality
      expect(client).toBeDefined();
      const connectionResult = await client?.connect('test-wallet');
      expect(connectionResult).toMatchObject({
        address: '0x123',
        accounts: ['0x123'],
        chain: expect.objectContaining({
          chainId: expect.any(String),
          chainType: expect.any(String),
        }),
      });

      await expect(client?.disconnect('test-wallet')).resolves.toBeUndefined();
      expect(client?.getConnection('test-wallet')).toBeUndefined();
      expect(typeof client?.on).toBe('function');
      expect(typeof client?.discoverWallets).toBe('function');
    });

    // Framework adapters removed - modal-core is now headless
  });
});
