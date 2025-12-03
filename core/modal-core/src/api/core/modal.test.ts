/**
 * Tests for modal API module
 * @internal
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockClient,
  createMockWalletInfo,
  createTestEnvironment,
  installCustomMatchers,
} from '../../testing/index.js';
import type { WalletInfo } from '../../types.js';
import { ChainType, type ModalFactoryConfig, createModal, createTestModal } from './modal.js';

// Install custom matchers
installCustomMatchers();

// Use the mock helper for the wallet client
const createMockWalletClient = () => createMockClient();

// Mock all internal modules to avoid side effects during testing
vi.mock('../../internal/factories/modalFactory.js', () => {
  const createMockModal = () => ({
    open: vi.fn(),
    close: vi.fn(),
    destroy: vi.fn(),
    getState: vi.fn(),
    updateConfig: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  return {
    createModalController: vi.fn(() => createMockModal()),
    createTestModal: vi.fn(() => createMockModal()),
  };
});

// Use real validation but mock the factory functions to avoid side effects

describe('modal API', () => {
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  const mockWalletInfo: WalletInfo = createMockWalletInfo('metamask', {
    name: 'MetaMask',
    chains: [ChainType.Evm],
  });

  describe('createModal (Service Factory)', () => {
    it('should create modal with service factory pattern', async () => {
      const config: ModalFactoryConfig = {
        wallets: [mockWalletInfo],
        client: createMockWalletClient(),
        // frameworkAdapter: framework adapters removed
      };

      const modal = createModal(config);

      expect(modal).toBeDefined();

      const { createModalController } = await import('../../internal/factories/modalFactory.js');
      expect(createModalController).toHaveBeenCalledWith(config);
    });

    it('should validate wallet configurations', async () => {
      const config: ModalFactoryConfig = {
        wallets: [mockWalletInfo],
        client: createMockWalletClient(),
        // frameworkAdapter: framework adapters removed
      };

      // Should not throw with valid configuration
      expect(() => createModal(config)).not.toThrow();
    });

    it('should throw error for invalid wallet configuration', async () => {
      const config: ModalFactoryConfig = {
        // @ts-expect-error Testing invalid wallet configuration
        wallets: [{ invalid: true }],
        client: createMockWalletClient(),
        // frameworkAdapter: framework adapters removed
      };

      expect(() => {
        createModal(config);
      }).toThrow('Invalid modal configuration');
    });
  });

  describe('createTestModal', () => {
    it('should create test modal', () => {
      const modal = createTestModal();

      expect(modal).toBeDefined();
      expect(modal.open).toBeTypeOf('function');
      expect(modal.close).toBeTypeOf('function');
      expect(modal.destroy).toBeTypeOf('function');
      expect(modal.getState).toBeTypeOf('function');
    });
  });

  describe('type exports', () => {
    it('should export ChainType enum', () => {
      expect(ChainType.Evm).toBeDefined();
      expect(ChainType.Evm).toBeDefined();
    });

    it('should export all modal factory types', () => {
      // Type-only test - if this compiles, the types are exported correctly
      const config: ModalFactoryConfig = {
        wallets: [],
        client: createMockWalletClient(),
        // frameworkAdapter: framework adapters removed
      };

      expect(config).toBeDefined();
    });
  });

  describe('integration scenarios', () => {
    it('should work with all factory functions', () => {
      const config: ModalFactoryConfig = {
        wallets: [mockWalletInfo],
        client: createMockWalletClient(),
        // frameworkAdapter: framework adapters removed
      };

      // Should all work without throwing
      const modal = createModal(config);
      const testModal = createTestModal();

      expect(modal).toBeDefined();
      expect(testModal).toBeDefined();
      expect(modal.open).toBeTypeOf('function');
      expect(testModal.open).toBeTypeOf('function');
    });

    it('should handle multiple wallets', () => {
      const multiWalletConfig: ModalFactoryConfig = {
        wallets: [
          mockWalletInfo,
          {
            id: 'coinbase',
            name: 'Coinbase Wallet',
            icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxyZWN0IHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0iIzAwNTJmZiIvPjwvc3ZnPg==',
            chains: [ChainType.Evm],
          },
        ],
        client: createMockWalletClient(),
        // frameworkAdapter: framework adapters removed
      };

      const modal = createModal(multiWalletConfig);
      expect(modal).toBeDefined();
    });

    it('should handle optional configuration properties', () => {
      const config: ModalFactoryConfig = {
        wallets: [mockWalletInfo],
        client: createMockWalletClient(),
        // frameworkAdapter: framework adapters removed
        initialView: 'walletSelection',
        autoCloseDelay: 5000,
        persistWalletSelection: true,
      };

      const modal = createModal(config);
      expect(modal).toBeDefined();
      expect(modal.open).toBeTypeOf('function');
    });
  });
});
