/**
 * DAppRpcService Tests
 *
 * Tests for dApp RPC Service functionality including:
 * - Endpoint Registration and Management
 * - RPC Call Execution and Load Balancing
 * - Retry Logic and Error Handling
 * - Statistics and Monitoring
 * - Configuration Management
 *
 * @group unit
 * @group services
 * @group dapp-rpc
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestEnvironment, installCustomMatchers } from '../../testing/index.js';
import { ChainType } from '../../types.js';
import type { SupportedChain } from '../../types.js';
import type { DAppRpcConfig, DAppRpcEndpoint, DAppRpcServiceDependencies } from './dAppRpcService.js';
import { DAppRpcService } from './dAppRpcService.js';

// Install domain-specific matchers
installCustomMatchers();

// Mock fetch globally
global.fetch = vi.fn();

// Helper function to create test endpoint
function createTestEndpoint(overrides: Partial<DAppRpcEndpoint> = {}): DAppRpcEndpoint {
  return {
    chain: { chainId: 'eip155:1', chainType: ChainType.Evm, name: 'Ethereum' } as SupportedChain,
    chainType: ChainType.Evm,
    urls: ['https://primary.rpc', 'https://backup.rpc'],
    config: {
      timeout: 5000,
      retries: 2,
      loadBalance: true,
    },
    ...overrides,
  };
}

// Helper function to create mock fetch response
function createMockResponse(data: unknown, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response);
}

describe('DAppRpcService', () => {
  let service: DAppRpcService;
  let mockFetch: ReturnType<typeof vi.fn>;
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();
    vi.useFakeTimers();

    // Reset fetch mock
    mockFetch = vi.mocked(global.fetch);
    mockFetch.mockClear();

    service = new DAppRpcService();
  });

  afterEach(async () => {
    await testEnv.teardown();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Endpoint Management', () => {
    describe('Endpoint registration', () => {
      it('should register endpoint successfully', () => {
        const endpoint = createTestEndpoint();

        expect(() => service.registerEndpoint(endpoint)).not.toThrow();
        expect(service.hasEndpoint('eip155:1')).toBe(true);
        expect(service.getRegisteredChains()).toContain('eip155:1');
      });

      it('should register multiple endpoints for different chains', () => {
        const ethEndpoint = createTestEndpoint({
          chain: { chainId: 'eip155:1', chainType: ChainType.Evm, name: 'Ethereum' } as SupportedChain,
        });

        const polygonEndpoint = createTestEndpoint({
          chain: { chainId: 'eip155:137', chainType: ChainType.Evm, name: 'Polygon' } as SupportedChain,
          urls: ['https://polygon.rpc'],
        });

        service.registerEndpoint(ethEndpoint);
        service.registerEndpoint(polygonEndpoint);

        expect(service.hasEndpoint('eip155:1')).toBe(true);
        expect(service.hasEndpoint('eip155:137')).toBe(true);
        expect(service.getRegisteredChains()).toEqual(['eip155:1', 'eip155:137']);
      });

      it('should override existing endpoint when registering same chain', () => {
        const endpoint1 = createTestEndpoint({
          urls: ['https://first.rpc'],
        });

        const endpoint2 = createTestEndpoint({
          urls: ['https://second.rpc'],
        });

        service.registerEndpoint(endpoint1);
        service.registerEndpoint(endpoint2);

        const endpointInfo = service.getEndpointInfo('eip155:1');
        expect(endpointInfo?.urls).toEqual(['https://second.rpc']);
      });

      it('should register endpoint with custom configuration', () => {
        const customConfig: DAppRpcConfig = {
          timeout: 10000,
          retries: 5,
          loadBalance: false,
          headers: {
            Authorization: 'Bearer test-token',
            'X-API-Key': 'test-key',
          },
        };

        const endpoint = createTestEndpoint({
          config: customConfig,
        });

        service.registerEndpoint(endpoint);
        const endpointInfo = service.getEndpointInfo('eip155:1');
        expect(endpointInfo?.config).toEqual(customConfig);
      });
    });

    describe('Endpoint removal', () => {
      it('should remove existing endpoint', () => {
        const endpoint = createTestEndpoint();
        service.registerEndpoint(endpoint);

        expect(service.hasEndpoint('eip155:1')).toBe(true);

        const removed = service.removeEndpoint('eip155:1');
        expect(removed).toBe(true);
        expect(service.hasEndpoint('eip155:1')).toBe(false);
        expect(service.getRegisteredChains()).not.toContain('eip155:1');
      });

      it('should return false when removing non-existent endpoint', () => {
        const removed = service.removeEndpoint('eip155:999');
        expect(removed).toBe(false);
      });

      it('should handle removal of already removed endpoint', () => {
        const endpoint = createTestEndpoint();
        service.registerEndpoint(endpoint);

        service.removeEndpoint('eip155:1');
        const removed = service.removeEndpoint('eip155:1');
        expect(removed).toBe(false);
      });
    });

    describe('Endpoint queries', () => {
      it('should check endpoint existence', () => {
        expect(service.hasEndpoint('eip155:1')).toBe(false);

        const endpoint = createTestEndpoint();
        service.registerEndpoint(endpoint);

        expect(service.hasEndpoint('eip155:1')).toBe(true);
        expect(service.hasEndpoint('eip155:999')).toBe(false);
      });

      it('should get endpoint information', () => {
        const endpoint = createTestEndpoint();
        service.registerEndpoint(endpoint);

        const endpointInfo = service.getEndpointInfo('eip155:1');
        expect(endpointInfo).toEqual(endpoint);
      });

      it('should return undefined for non-existent endpoint', () => {
        const endpointInfo = service.getEndpointInfo('eip155:999');
        expect(endpointInfo).toBeUndefined();
      });

      it('should get empty list when no endpoints registered', () => {
        expect(service.getRegisteredChains()).toEqual([]);
      });
    });

    describe('Clear endpoints', () => {
      it('should clear all endpoints', () => {
        const endpoint1 = createTestEndpoint();
        const endpoint2 = createTestEndpoint({
          chain: { chainId: 'eip155:137', chainType: ChainType.Evm, name: 'Polygon' } as SupportedChain,
        });

        service.registerEndpoint(endpoint1);
        service.registerEndpoint(endpoint2);

        expect(service.getRegisteredChains()).toHaveLength(2);

        service.clear();

        expect(service.getRegisteredChains()).toHaveLength(0);
        expect(service.hasEndpoint('eip155:1')).toBe(false);
        expect(service.hasEndpoint('eip155:137')).toBe(false);
      });

      it('should handle clearing empty service', () => {
        expect(() => service.clear()).not.toThrow();
        expect(service.getRegisteredChains()).toHaveLength(0);
      });
    });
  });

  describe('RPC Call Execution', () => {
    beforeEach(() => {
      const endpoint = createTestEndpoint();
      service.registerEndpoint(endpoint);
    });

    describe('Successful RPC calls', () => {
      it('should make successful RPC call', async () => {
        const mockResponse = {
          jsonrpc: '2.0',
          id: 1,
          result: '0x1234567',
        };

        // Mock response directly
        mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

        const result = await service.call('eip155:1', 'eth_blockNumber');

        expect(result.data).toBe('0x1234567');
        expect(result.endpoint).toBe('https://primary.rpc');
        expect(result.responseTime).toBeGreaterThanOrEqual(0);
        expect(result.isRetry).toBe(false);

        expect(mockFetch).toHaveBeenCalledWith('https://primary.rpc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('"jsonrpc":"2.0"'),
          signal: expect.any(AbortSignal),
        });
      });

      it('should make RPC call with parameters', async () => {
        const mockResponse = {
          jsonrpc: '2.0',
          id: 1,
          result: '0xde0b6b3a7640000',
        };

        mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

        const result = await service.call('eip155:1', 'eth_getBalance', [
          '0x742d35Cc6634C0532925a3b8D400E67C7B2D6b77',
          'latest',
        ]);

        expect(result.data).toBe('0xde0b6b3a7640000');

        expect(mockFetch).toHaveBeenCalledWith('https://primary.rpc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('"method":"eth_getBalance"'),
          signal: expect.any(AbortSignal),
        });
      });

      it('should include custom headers when configured', async () => {
        const endpointWithHeaders = createTestEndpoint({
          config: {
            headers: {
              Authorization: 'Bearer test-token',
              'X-API-Key': 'test-key',
            },
          },
        });

        service.registerEndpoint(endpointWithHeaders);

        const mockResponse = {
          jsonrpc: '2.0',
          id: 1,
          result: 'success',
        };

        mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

        await service.call('eip155:1', 'test_method');

        expect(mockFetch).toHaveBeenCalledWith('https://primary.rpc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
            'X-API-Key': 'test-key',
          },
          body: expect.any(String),
          signal: expect.any(AbortSignal),
        });
      });
    });

    describe('Load balancing', () => {
      it('should use round-robin load balancing', async () => {
        const mockResponse = {
          jsonrpc: '2.0',
          id: 1,
          result: 'success',
        };

        mockFetch.mockResolvedValue(createMockResponse(mockResponse));

        // Make multiple calls
        await service.call('eip155:1', 'test_method1');
        await service.call('eip155:1', 'test_method2');
        await service.call('eip155:1', 'test_method3');

        // Should use different endpoints in round-robin fashion
        // First call uses primary (index 0), then rotates to backup (index 1), then back to primary (index 0)
        const calls = mockFetch.mock.calls;
        expect(calls[0][0]).toBe('https://primary.rpc');
        expect(calls[1][0]).toBe('https://backup.rpc');
        expect(calls[2][0]).toBe('https://primary.rpc'); // Back to first
      });

      it('should not load balance when disabled', async () => {
        const endpoint = createTestEndpoint({
          config: {
            loadBalance: false,
          },
        });

        service.registerEndpoint(endpoint);

        const mockResponse = {
          jsonrpc: '2.0',
          id: 1,
          result: 'success',
        };

        mockFetch.mockResolvedValue(createMockResponse(mockResponse));

        // Make multiple calls
        await service.call('eip155:1', 'test_method1');
        await service.call('eip155:1', 'test_method2');

        // Should always use first endpoint
        const calls = mockFetch.mock.calls;
        expect(calls[0][0]).toBe('https://primary.rpc');
        expect(calls[1][0]).toBe('https://primary.rpc');
      });
    });

    describe('Error handling and retries', () => {
      it('should retry on network failure', async () => {
        const mockResponse = {
          jsonrpc: '2.0',
          id: 1,
          result: 'success',
        };

        // First call fails, second succeeds
        mockFetch
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce(createMockResponse(mockResponse));

        const result = await service.call('eip155:1', 'test_method');

        expect(result.data).toBe('success');
        expect(result.isRetry).toBe(true);
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      it('should use fallback endpoint on failure', async () => {
        const mockResponse = {
          jsonrpc: '2.0',
          id: 1,
          result: 'success',
        };

        // Primary endpoint fails, fallback succeeds
        mockFetch
          .mockRejectedValueOnce(new Error('Primary failed'))
          .mockResolvedValueOnce(createMockResponse(mockResponse));

        const result = await service.call('eip155:1', 'test_method');

        expect(result.data).toBe('success');
        expect(result.endpoint).toBe('https://backup.rpc');
        expect(result.isRetry).toBe(true);
      });

      it('should handle RPC error responses', async () => {
        const mockErrorResponse = {
          jsonrpc: '2.0',
          id: 1,
          error: {
            code: -32601,
            message: 'Method not found',
          },
        };

        mockFetch.mockResolvedValueOnce(createMockResponse(mockErrorResponse));

        // ErrorFactory.messageFailed throws ModalError, check for the message and code
        try {
          await service.call('eip155:1', 'invalid_method');
          throw new Error('Expected call to throw');
        } catch (error) {
          expect(error).toMatchObject({
            code: 'message_failed',
            category: 'network',
          });
          // The actual error message contains retry attempts, just verify it contains the key part
          expect(error.message).toContain('dApp RPC call failed');
        }
      });

      it('should fail after exhausting all retries', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));

        await expect(service.call('eip155:1', 'test_method')).rejects.toThrow('Network error');

        // Should attempt all retries (2 + 1 initial = 3 total)
        expect(mockFetch).toHaveBeenCalledTimes(3);
      });

      it('should respect timeout configuration', async () => {
        const endpoint = createTestEndpoint({
          config: {
            timeout: 100, // Very short timeout
          },
        });

        service.registerEndpoint(endpoint);

        // Mock fetch to throw an AbortError to simulate timeout
        mockFetch.mockRejectedValue(new DOMException('The operation was aborted', 'AbortError'));

        await expect(service.call('eip155:1', 'test_method')).rejects.toThrow(
          'dApp RPC call failed after 4 attempts',
        );
      });
    });

    describe('Error conditions', () => {
      it('should throw error for unregistered chain', async () => {
        await expect(service.call('eip155:999', 'test_method')).rejects.toThrow(
          'No dApp RPC endpoint registered for chain eip155:999',
        );
      });

      it('should handle empty endpoint URLs', async () => {
        const endpoint = createTestEndpoint({
          urls: [],
        });

        // Register endpoint with empty URLs (should not throw)
        service.registerEndpoint(endpoint);

        // But calling with empty URLs should fail
        await expect(service.call('eip155:1', 'test_method')).rejects.toThrow();
      });

      it('should handle invalid JSON response', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.reject(new Error('Invalid JSON')),
          text: () => Promise.resolve('Invalid JSON response'),
        } as Response);

        await expect(service.call('eip155:1', 'test_method')).rejects.toThrow(
          'dApp RPC call failed after 3 attempts',
        );
      });

      it('should handle HTTP error responses', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.resolve({}),
          text: () => Promise.resolve('Server Error'),
        } as Response);

        await expect(service.call('eip155:1', 'test_method')).rejects.toThrow(
          'dApp RPC call failed after 3 attempts',
        );
      });
    });
  });

  describe('Statistics and Monitoring', () => {
    beforeEach(() => {
      const endpoint = createTestEndpoint();
      service.registerEndpoint(endpoint);
    });

    it('should track basic service statistics', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: 'success',
      };

      mockFetch.mockResolvedValue(createMockResponse(mockResponse));

      await service.call('eip155:1', 'test_method1');
      await service.call('eip155:1', 'test_method2');

      const stats = service.getStats();

      expect(stats.totalEndpoints).toBe(1);
      expect(stats.chainIds).toContain('eip155:1');
      expect(stats.totalUrls).toBe(2); // primary + backup URLs
    });

    it('should provide endpoint statistics', () => {
      // Add a second endpoint
      const endpoint2 = createTestEndpoint({
        chain: { chainId: 'eip155:137', chainType: ChainType.Evm, name: 'Polygon' } as SupportedChain,
        urls: ['https://polygon.rpc', 'https://polygon-backup.rpc', 'https://polygon-fallback.rpc'],
      });

      service.registerEndpoint(endpoint2);

      const stats = service.getStats();

      expect(stats.totalEndpoints).toBe(2);
      expect(stats.chainIds).toContain('eip155:1');
      expect(stats.chainIds).toContain('eip155:137');
      expect(stats.totalUrls).toBe(5); // 2 + 3 URLs
    });

    it('should update statistics after clearing endpoints', () => {
      const stats = service.getStats();
      expect(stats.totalEndpoints).toBe(1);

      service.clear();
      const newStats = service.getStats();
      expect(newStats.totalEndpoints).toBe(0);
      expect(newStats.chainIds).toHaveLength(0);
      expect(newStats.totalUrls).toBe(0);
    });
  });

  describe('Service Configuration', () => {
    it('should create service with default dependencies', () => {
      const defaultService = new DAppRpcService();
      expect(defaultService.getRegisteredChains()).toEqual([]);
    });

    it('should create service with custom dependencies', () => {
      const customDependencies: DAppRpcServiceDependencies = {};
      const customService = new DAppRpcService(customDependencies);
      expect(customService.getRegisteredChains()).toEqual([]);
    });

    it('should handle partial dependencies', () => {
      const partialService = new DAppRpcService({});
      expect(partialService.getRegisteredChains()).toEqual([]);
    });
  });
});
