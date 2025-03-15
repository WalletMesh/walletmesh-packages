import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChainType } from '../../types/chains.js';
import { ClientEventType } from '../../types/events.js';
import { ProviderInterface } from '../../types/providers.js';
import { FireWalletConnector } from './index.js';
import type { ChromeExtensionConfig } from './types.js';

class MockPort {
  private messageHandlers = new Set<(message: unknown) => void>();
  private disconnectHandlers = new Set<() => void>();
  private mockProviderResponse = { type: 'eip1193', version: '1.0.0' };

  onMessage = {
    addListener: (handler: (message: unknown) => void) => {
      this.messageHandlers.add(handler);
    },
    removeListener: (handler: (message: unknown) => void) => {
      this.messageHandlers.delete(handler);
    },
  };

  onDisconnect = {
    addListener: (handler: () => void) => {
      this.disconnectHandlers.add(handler);
    },
  };

  postMessage(message: { type: string; data?: unknown }): void {
    // Simulate async response
    setTimeout(() => {
      const response = {
        success: true,
        data: this.getMockResponse(message),
      };
      for (const handler of this.messageHandlers) {
        handler(response);
      }
    }, 0);
  }

  private getMockResponse(message: { type: string; data?: unknown }): unknown {
    switch (message.type) {
      case 'getProvider':
        return this.mockProviderResponse;
      case 'connect':
        return ['0x123'];
      case 'disconnect':
        // Update provider response after disconnect to simulate new instance
        this.mockProviderResponse = { type: 'eip1193', version: '1.0.1' };
        return null;
      default:
        return {};
    }
  }

  disconnect(): void {
    for (const handler of this.disconnectHandlers) {
      handler();
    }
  }

  triggerMessage(type: string, data?: unknown): void {
    for (const handler of this.messageHandlers) {
      handler({ type, success: true, data });
    }
  }
}

const mockPort = new MockPort();
const mockRuntime = {
  connect: vi.fn().mockReturnValue(mockPort),
};

// @ts-expect-error - Mocking global chrome object
global.chrome = { runtime: mockRuntime };

describe('FireWalletConnector', () => {
  let connector: FireWalletConnector;
  const config: ChromeExtensionConfig = {
    extensionId: 'test-extension-id',
    timeout: 100, // Short timeout for tests
  };

  beforeEach(() => {
    vi.clearAllMocks();
    connector = new FireWalletConnector(config);
  });

  describe('initialization', () => {
    it('should initialize successfully when wallet is available', async () => {
      await connector.initialize();
      expect(mockRuntime.connect).toHaveBeenCalledWith('test-extension-id');
    });

    it('should fail initialization when wallet is not available', async () => {
      mockRuntime.connect.mockImplementationOnce(() => {
        throw new Error('Extension not found');
      });

      await expect(connector.initialize()).rejects.toThrow('Failed to initialize');
    });
  });

  describe('provider interfaces', () => {
    beforeEach(async () => {
      await connector.initialize();
    });

    it('should support multiple provider interfaces', () => {
      expect(connector.supportedProviders).toContain(ProviderInterface.EIP1193);
      expect(connector.supportedProviders).toContain(ProviderInterface.EIP6963);
      expect(connector.supportedProviders).toContain(ProviderInterface.ETHERS);
      expect(connector.supportedProviders).toContain(ProviderInterface.NATIVE);
    });

    it('should validate provider interface support', () => {
      expect(() => {
        connector.getProvider('unsupported' as ProviderInterface);
      }).toThrow('Provider interface unsupported is not supported');
    });

    it('should cache provider instances', () => {
      const provider1 = connector.getProvider(ProviderInterface.EIP1193);
      const provider2 = connector.getProvider(ProviderInterface.EIP1193);
      expect(provider1).toBe(provider2);
    });
  });

  describe('connection flows', () => {
    beforeEach(async () => {
      await connector.initialize();
    });

    it('should connect successfully', async () => {
      const result = await connector.connect();
      expect(result.chain).toBe(ChainType.ETHEREUM);
      expect(result.provider).toBe(ProviderInterface.EIP1193);
      expect(result.accounts).toEqual(['0x123']);
    });

    it('should disconnect successfully', async () => {
      // Get initial provider
      const provider1 = connector.getProvider(ProviderInterface.EIP1193);

      await connector.connect();
      await connector.disconnect();

      // Should create new provider with updated mock response
      const provider2 = connector.getProvider(ProviderInterface.EIP1193);
      expect(provider2).not.toBe(provider1);
    });
  });

  describe('error handling', () => {
    it('should handle connection timeout', async () => {
      const timeoutConnector = new FireWalletConnector({
        ...config,
        timeout: 1,
      });

      await expect(async () => {
        await timeoutConnector.initialize();
        await timeoutConnector.connect();
      }).rejects.toThrow('timed out');
    });

    it('should handle disconnection by wallet', async () => {
      await connector.initialize();
      const onDisconnect = vi.fn();
      connector.on(ClientEventType.DISCONNECTED, onDisconnect);

      mockPort.triggerMessage('disconnect');
      await vi.waitFor(() => {
        expect(onDisconnect).toHaveBeenCalled();
      });
    });
  });
});
