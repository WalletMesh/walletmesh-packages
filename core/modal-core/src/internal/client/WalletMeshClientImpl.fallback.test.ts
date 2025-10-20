import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicProviderWrapper } from '../../providers/PublicProvider.js';
import { WalletProviderFallbackWrapper } from '../../providers/WalletProviderFallbackWrapper.js';
import { createMockLogger, createMockModal, createMockRegistry } from '../../testing/helpers/mocks.js';
import { ChainType } from '../../types.js';
import type { Logger } from '../core/logger/logger.js';
import type { ModalController } from '../modal/controller.js';
import type { WalletRegistry } from '../registries/wallets/WalletRegistry.js';
import type { WalletMeshConfig } from './WalletMeshClient.js';
import { WalletMeshClient } from './WalletMeshClientImpl.js';

// Mock modules
vi.mock('../../providers/PublicProvider.js');
vi.mock('../../providers/WalletProviderFallbackWrapper.js');

describe('WalletMeshClientImpl - Public Provider Fallback', () => {
  let client: WalletMeshClient;
  let mockLogger: Logger;
  let mockRegistry: WalletRegistry;
  let mockModal: ModalController;
  let mockConfig: WalletMeshConfig;

  beforeEach(() => {
    // Don't use fake timers for these integration tests
    vi.clearAllMocks();
    mockLogger = createMockLogger();
    mockRegistry = createMockRegistry();
    mockModal = createMockModal();

    mockConfig = {
      appName: 'Test App',
      chains: [
        {
          chainId: 'eip155:1',
          chainType: 'evm',
          name: 'Ethereum',
          // No dappRpcUrls - should trigger fallback
        },
        {
          chainId: 'eip155:137',
          chainType: 'evm',
          name: 'Polygon',
          dappRpcUrls: ['https://polygon-rpc.com'], // Has dApp RPC
        },
      ],
    };

    client = new WalletMeshClient(mockConfig, mockRegistry, mockLogger);
    // Set modal using two-phase construction
    client.setModal(mockModal);
  });

  afterEach(() => {
    client.destroy();
    vi.restoreAllMocks();
  });

  describe('getPublicProvider', () => {
    it('should return null when client is not initialized', () => {
      const provider = client.getPublicProvider('eip155:1');
      expect(provider).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith('Client not initialized, cannot get public provider');
    });

    it('should return null for unknown chain', async () => {
      await client.initialize();

      const provider = client.getPublicProvider('eip155:999');
      expect(provider).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith('Chain eip155:999 not found in configuration');
    });

    it('should use dApp RPC when configured', async () => {
      await client.initialize();

      // Mock the dApp RPC service
      const mockDappRpcService = {
        hasEndpoint: vi.fn(() => true),
      };
      vi.spyOn(client, 'getDAppRpcService' as keyof typeof client).mockReturnValue(
        mockDappRpcService as never,
      );

      const provider = client.getPublicProvider('eip155:137');

      expect(mockDappRpcService.hasEndpoint).toHaveBeenCalledWith('eip155:137');
      expect(PublicProviderWrapper).toHaveBeenCalledWith(mockDappRpcService, 'eip155:137', ChainType.Evm);
      expect(provider).toBeInstanceOf(PublicProviderWrapper);
    });

    it('should fallback to wallet provider when no dApp RPC is configured', async () => {
      await client.initialize();

      // Mock no dApp RPC for chain 1
      const mockDappRpcService = {
        hasEndpoint: vi.fn(() => false),
      };
      vi.spyOn(client, 'getDAppRpcService' as keyof typeof client).mockReturnValue(
        mockDappRpcService as never,
      );

      // Mock an active session with wallet provider
      // Create a mock wallet provider that matches the WalletProvider interface
      const mockWalletProvider = {
        getAccounts: vi.fn().mockResolvedValue(['0x123']),
        getChainId: vi.fn().mockResolvedValue('eip155:1'),
        isConnected: vi.fn(() => true),
        on: vi.fn(),
        off: vi.fn(),
        disconnect: vi.fn(),
        request: vi.fn(),
      };

      const mockSession = {
        sessionId: 'test-session',
        status: 'connected',
        chain: { chainId: 'eip155:1', chainType: ChainType.Evm, name: 'Ethereum', required: true },
        provider: { instance: mockWalletProvider }, // The provider instance is directly used as WalletProvider
      };

      // Mock the sessionManager property getter
      const mockSessionManager = {
        getActiveSession: vi.fn().mockReturnValue(mockSession),
      };
      Object.defineProperty(client, 'sessionManager', {
        get: () => mockSessionManager,
        configurable: true,
      });

      const provider = client.getPublicProvider('eip155:1');

      expect(mockDappRpcService.hasEndpoint).toHaveBeenCalledWith('eip155:1');
      expect(WalletProviderFallbackWrapper).toHaveBeenCalledWith(
        mockWalletProvider,
        'eip155:1',
        ChainType.Evm,
      );
      expect(provider).toBeInstanceOf(WalletProviderFallbackWrapper);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Using wallet provider as fallback for public provider on chain eip155:1',
      );
    });

    it('should return null when no dApp RPC and no wallet fallback available', async () => {
      await client.initialize();

      // Mock no dApp RPC
      const mockDappRpcService = {
        hasEndpoint: vi.fn(() => false),
      };
      vi.spyOn(client, 'getDAppRpcService' as keyof typeof client).mockReturnValue(
        mockDappRpcService as never,
      );

      // Mock no active sessions
      // Mock the sessionManager property getter
      const mockSessionManager = {
        getActiveSession: vi.fn().mockReturnValue(null),
      };
      Object.defineProperty(client, 'sessionManager', {
        get: () => mockSessionManager,
        configurable: true,
      });

      const provider = client.getPublicProvider('eip155:1');

      expect(provider).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'No public provider available for chain eip155:1 (no dApp RPC or wallet fallback)',
      );
    });

    it('should not use wallet fallback for different chain', async () => {
      await client.initialize();

      // Mock no dApp RPC
      const mockDappRpcService = {
        hasEndpoint: vi.fn(() => false),
      };
      vi.spyOn(client, 'getDAppRpcService' as keyof typeof client).mockReturnValue(
        mockDappRpcService as never,
      );

      // Mock session on different chain
      const mockSession = {
        sessionId: 'test-session',
        status: 'connected',
        chain: { chainId: 'eip155:137', chainType: ChainType.Evm, name: 'Polygon', required: true }, // Different chain
        provider: { instance: {} },
      };

      // Mock the sessionManager property getter
      const mockSessionManager = {
        getActiveSession: vi.fn().mockReturnValue(mockSession),
      };
      Object.defineProperty(client, 'sessionManager', {
        get: () => mockSessionManager,
        configurable: true,
      });

      const provider = client.getPublicProvider('eip155:1');

      expect(provider).toBeNull();
    });

    it('should not use disconnected wallet as fallback', async () => {
      await client.initialize();

      // Mock no dApp RPC
      const mockDappRpcService = {
        hasEndpoint: vi.fn(() => false),
      };
      vi.spyOn(client, 'getDAppRpcService' as keyof typeof client).mockReturnValue(
        mockDappRpcService as never,
      );

      // Mock disconnected session
      const mockSession = {
        sessionId: 'test-session',
        status: 'disconnected', // Not connected
        chain: { chainId: 'eip155:1', chainType: ChainType.Evm, name: 'Ethereum', required: true },
        provider: { instance: {} },
      };

      // Mock the sessionManager property getter
      const mockSessionManager = {
        getActiveSession: vi.fn().mockReturnValue(mockSession),
      };
      Object.defineProperty(client, 'sessionManager', {
        get: () => mockSessionManager,
        configurable: true,
      });

      const provider = client.getPublicProvider('eip155:1');

      expect(provider).toBeNull();
    });
  });
});
