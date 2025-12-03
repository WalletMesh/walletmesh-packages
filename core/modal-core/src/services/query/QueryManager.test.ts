/**
 * QueryManager Tests
 *
 * Tests for QueryManager functionality including:
 * - TanStack Query Client Configuration
 * - Query Client Creation and Management
 * - Cache Management and Cleanup
 * - Default Configuration Handling
 * - Custom Configuration Support
 *
 * @group unit
 * @group services
 * @group query
 */

import type { QueryClientConfig } from '@tanstack/query-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockServiceDependencies,
  createTestEnvironment,
  installCustomMatchers,
} from '../../testing/index.js';
import type { QueryManagerDependencies } from './QueryManager.js';
import { QueryManager } from './QueryManager.js';

// Install domain-specific matchers
installCustomMatchers();

// Mock TanStack Query Core
vi.mock('@tanstack/query-core');

describe('QueryManager', () => {
  let queryManager: QueryManager;
  let mockDependencies: QueryManagerDependencies;
  const testEnv = createTestEnvironment();

  // Define mock methods
  const mockClear = vi.fn();
  const mockInvalidateQueries = vi.fn();
  const mockRemoveQueries = vi.fn();
  const mockCancelQueries = vi.fn();
  const mockGetQueryData = vi.fn();
  const mockSetQueryData = vi.fn();
  const mockFetchQuery = vi.fn();
  const mockPrefetchQuery = vi.fn();
  const mockGetQueryCache = vi.fn(() => ({
    clear: vi.fn(),
  }));
  const mockGetMutationCache = vi.fn(() => ({
    clear: vi.fn(),
  }));
  const mockMount = vi.fn();

  beforeEach(async () => {
    await testEnv.setup();

    mockDependencies = {
      ...createMockServiceDependencies(),
    };

    // Setup QueryClient mock
    const { QueryClient } = await import('@tanstack/query-core');
    vi.mocked(QueryClient).mockImplementation(
      (config?: QueryClientConfig) =>
        ({
          clear: mockClear,
          invalidateQueries: mockInvalidateQueries,
          removeQueries: mockRemoveQueries,
          cancelQueries: mockCancelQueries,
          getQueryData: mockGetQueryData,
          setQueryData: mockSetQueryData,
          fetchQuery: mockFetchQuery,
          prefetchQuery: mockPrefetchQuery,
          getQueryCache: mockGetQueryCache,
          getMutationCache: mockGetMutationCache,
          mount: mockMount,
          getDefaultOptions: vi.fn(() => config?.defaultOptions || {}),
        }) as unknown as ConstructorParameters<typeof QueryClient>[0],
    );
  });

  afterEach(async () => {
    await testEnv.teardown();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    describe('Default configuration', () => {
      it('should create QueryManager with default configuration', () => {
        queryManager = new QueryManager(mockDependencies);

        expect(queryManager).toBeInstanceOf(QueryManager);
        expect(queryManager.getQueryClient()).toBeDefined();
      });

      it('should apply default query options', async () => {
        queryManager = new QueryManager(mockDependencies);
        const queryClient = queryManager.getQueryClient();

        // Verify QueryClient was created
        expect(queryClient).toBeDefined();

        // Check that QueryClient constructor was called with defaults
        const { QueryClient } = await import('@tanstack/query-core');
        expect(vi.mocked(QueryClient)).toHaveBeenCalledWith(
          expect.objectContaining({
            defaultOptions: expect.objectContaining({
              queries: expect.objectContaining({
                staleTime: 30 * 1000,
                gcTime: 5 * 60 * 1000,
                retry: 3,
                refetchOnWindowFocus: true,
                refetchOnReconnect: 'always',
              }),
              mutations: expect.objectContaining({
                retry: 1,
                retryDelay: 1000,
              }),
            }),
          }),
        );
      });

      it('should handle missing dependencies gracefully', () => {
        const minimalDeps: QueryManagerDependencies = {
          logger: createMockServiceDependencies().logger,
        };

        expect(() => {
          queryManager = new QueryManager(minimalDeps);
        }).not.toThrow();
      });
    });

    describe('Custom configuration', () => {
      it('should create QueryManager with custom configuration', async () => {
        const customConfig: QueryClientConfig = {
          defaultOptions: {
            queries: {
              staleTime: 60 * 1000, // 1 minute
              gcTime: 10 * 60 * 1000, // 10 minutes
              retry: 5,
              refetchOnWindowFocus: false,
            },
            mutations: {
              retry: 3,
            },
          },
        };

        const customDependencies: QueryManagerDependencies = {
          ...mockDependencies,
          queryConfig: customConfig,
        };

        queryManager = new QueryManager(customDependencies);

        // Verify the config was merged with defaults
        const { QueryClient } = await import('@tanstack/query-core');
        expect(vi.mocked(QueryClient)).toHaveBeenCalledWith(
          expect.objectContaining({
            defaultOptions: expect.objectContaining({
              queries: expect.objectContaining({
                staleTime: 60 * 1000,
                gcTime: 10 * 60 * 1000,
                retry: 5,
                refetchOnWindowFocus: false,
                refetchOnReconnect: 'always', // From defaults
              }),
              mutations: expect.objectContaining({
                retry: 3,
                retryDelay: 1000, // From defaults
              }),
            }),
          }),
        );
      });

      it('should merge custom config with defaults', async () => {
        const partialConfig: QueryClientConfig = {
          defaultOptions: {
            queries: {
              staleTime: 60 * 1000, // Override stale time only
            },
          },
        };

        const customDependencies: QueryManagerDependencies = {
          ...mockDependencies,
          queryConfig: partialConfig,
        };

        queryManager = new QueryManager(customDependencies);

        // Verify the config was merged with defaults
        const { QueryClient } = await import('@tanstack/query-core');
        expect(vi.mocked(QueryClient)).toHaveBeenCalledWith(
          expect.objectContaining({
            defaultOptions: expect.objectContaining({
              queries: expect.objectContaining({
                staleTime: 60 * 1000, // Override
                gcTime: 5 * 60 * 1000, // From defaults
                retry: 3, // From defaults
                refetchOnWindowFocus: true, // From defaults
                refetchOnReconnect: 'always', // From defaults
              }),
              mutations: expect.objectContaining({
                retry: 1, // From defaults
                retryDelay: 1000, // From defaults
              }),
            }),
          }),
        );
      });

      it('should handle empty custom configuration', async () => {
        const emptyConfig: QueryClientConfig = {};

        const customDependencies: QueryManagerDependencies = {
          ...mockDependencies,
          queryConfig: emptyConfig,
        };

        queryManager = new QueryManager(customDependencies);

        // Verify the config was merged with defaults even with empty config
        const { QueryClient } = await import('@tanstack/query-core');
        expect(vi.mocked(QueryClient)).toHaveBeenCalledWith(
          expect.objectContaining({
            defaultOptions: expect.objectContaining({
              queries: expect.objectContaining({
                staleTime: 30 * 1000,
                gcTime: 5 * 60 * 1000,
                retry: 3,
                refetchOnWindowFocus: true,
                refetchOnReconnect: 'always',
              }),
              mutations: expect.objectContaining({
                retry: 1,
                retryDelay: 1000,
              }),
            }),
          }),
        );
      });
    });
  });

  describe('Query Client Access', () => {
    beforeEach(() => {
      queryManager = new QueryManager(mockDependencies);
    });

    it('should return the same query client instance', () => {
      const client1 = queryManager.getQueryClient();
      const client2 = queryManager.getQueryClient();

      expect(client1).toBe(client2);
      expect(client1).toBeDefined();
    });

    it('should provide access to QueryClient methods', () => {
      const queryClient = queryManager.getQueryClient();

      // Verify important QueryClient methods are available
      expect(queryClient.clear).toBeDefined();
      expect(queryClient.invalidateQueries).toBeDefined();
      expect(queryClient.removeQueries).toBeDefined();
      expect(queryClient.fetchQuery).toBeDefined();
      expect(queryClient.prefetchQuery).toBeDefined();
    });

    it('should allow direct query client usage', () => {
      const queryClient = queryManager.getQueryClient();

      // Test that we can call methods on the query client
      expect(() => {
        queryClient.getQueryData(['test-key']);
        queryClient.setQueryData(['test-key'], 'test-data');
      }).not.toThrow();
    });
  });

  describe('Cache Management', () => {
    beforeEach(() => {
      queryManager = new QueryManager(mockDependencies);
    });

    describe('Clear operations', () => {
      it('should clear all cached data', () => {
        queryManager.clear();

        queryManager.getQueryClient();
        expect(mockClear).toHaveBeenCalledOnce();
      });

      it('should clear query cache through client clear', () => {
        queryManager.clear();

        queryManager.getQueryClient();
        expect(mockClear).toHaveBeenCalledOnce();
      });

      it('should clear mutation cache through client clear', () => {
        queryManager.clear();

        queryManager.getQueryClient();
        expect(mockClear).toHaveBeenCalledOnce();
      });

      it('should handle clear operation errors gracefully', () => {
        mockClear.mockImplementationOnce(() => {
          throw new Error('Clear failed');
        });

        // QueryManager.clear() doesn't catch errors, so it will throw
        expect(() => queryManager.clear()).toThrow('Clear failed');
      });
    });

    describe('Cleanup operations', () => {
      it('should cleanup query client resources', () => {
        queryManager.cleanup();

        queryManager.getQueryClient();
        expect(mockCancelQueries).toHaveBeenCalledOnce();
        expect(mockClear).toHaveBeenCalledOnce();
      });

      it('should handle cleanup operation errors gracefully', () => {
        mockCancelQueries.mockImplementationOnce(() => {
          throw new Error('Cleanup failed');
        });

        // QueryManager.cleanup() doesn't catch errors, so it will throw
        expect(() => queryManager.cleanup()).toThrow('Cleanup failed');
      });

      it('should be safe to call cleanup multiple times', () => {
        queryManager.cleanup();
        queryManager.cleanup();

        queryManager.getQueryClient();
        expect(mockCancelQueries).toHaveBeenCalledTimes(2);
        expect(mockClear).toHaveBeenCalledTimes(2);
      });
    });

    describe('Clear vs Cleanup distinction', () => {
      it('should call different methods for clear vs cleanup', () => {
        queryManager.getQueryClient();

        queryManager.clear();
        expect(mockClear).toHaveBeenCalledOnce();
        expect(mockCancelQueries).not.toHaveBeenCalled();

        vi.clearAllMocks();

        queryManager.cleanup();
        expect(mockClear).toHaveBeenCalledOnce();
        expect(mockCancelQueries).toHaveBeenCalledOnce();
      });
    });
  });

  describe('Integration Patterns', () => {
    beforeEach(() => {
      queryManager = new QueryManager(mockDependencies);
    });

    it('should support balance query patterns', async () => {
      const queryClient = queryManager.getQueryClient();

      // Mock a balance query
      const mockBalanceData = { value: '1000000000000000000', formatted: '1.0' };
      mockFetchQuery.mockResolvedValue(mockBalanceData);

      const result = await queryClient.fetchQuery({
        queryKey: ['balance', '0x123', 'eip155:1'],
        queryFn: () => Promise.resolve(mockBalanceData),
      });

      expect(result).toEqual(mockBalanceData);
      expect(mockFetchQuery).toHaveBeenCalledWith({
        queryKey: ['balance', '0x123', 'eip155:1'],
        queryFn: expect.any(Function),
      });
    });

    it('should support wallet session query patterns', async () => {
      const queryClient = queryManager.getQueryClient();

      const mockSessionData = { walletId: 'metamask', address: '0x123' };
      mockGetQueryData.mockReturnValue(mockSessionData);

      const result = queryClient.getQueryData(['session', 'metamask']);

      expect(result).toEqual(mockSessionData);
      expect(mockGetQueryData).toHaveBeenCalledWith(['session', 'metamask']);
    });

    it('should support transaction monitoring patterns', () => {
      const queryClient = queryManager.getQueryClient();

      const mockTxData = { hash: '0xabc', status: 'pending' };

      queryClient.setQueryData(['transaction', '0xabc'], mockTxData);

      expect(mockSetQueryData).toHaveBeenCalledWith(['transaction', '0xabc'], mockTxData);
    });

    it('should support cache invalidation patterns', () => {
      const queryClient = queryManager.getQueryClient();

      // Simulate invalidating balance queries for a specific wallet
      queryClient.invalidateQueries({ queryKey: ['balance', '0x123'] });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['balance', '0x123'],
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle QueryClient creation errors', async () => {
      const { QueryClient } = await import('@tanstack/query-core');
      vi.mocked(QueryClient).mockImplementationOnce(() => {
        throw new Error('QueryClient creation failed');
      });

      expect(() => {
        queryManager = new QueryManager(mockDependencies);
      }).toThrow('QueryClient creation failed');
    });

    it('should handle invalid configuration gracefully', () => {
      const invalidConfig = {
        defaultOptions: {
          queries: {
            staleTime: 'invalid' as unknown, // Invalid type
          },
        },
      };

      const deps: QueryManagerDependencies = {
        ...mockDependencies,
        queryConfig: invalidConfig,
      };

      // QueryClient constructor should handle invalid config
      expect(() => {
        queryManager = new QueryManager(deps);
      }).not.toThrow();
    });
  });

  describe('Memory Management', () => {
    beforeEach(() => {
      queryManager = new QueryManager(mockDependencies);
    });

    it('should not leak memory through query client', () => {
      // Create multiple queries to simulate usage
      const queryClient = queryManager.getQueryClient();

      for (let i = 0; i < 100; i++) {
        queryClient.setQueryData([`test-query-${i}`], `data-${i}`);
      }

      // Clear should remove all data
      queryManager.clear();

      expect(mockClear).toHaveBeenCalled();
    });

    it('should properly cleanup on service destruction', () => {
      queryManager.getQueryClient();

      queryManager.cleanup();

      expect(mockCancelQueries).toHaveBeenCalled();
      expect(mockClear).toHaveBeenCalled();
    });
  });

  describe('Configuration Edge Cases', () => {
    it('should handle null/undefined queryConfig', () => {
      const deps1: QueryManagerDependencies = {
        ...mockDependencies,
        queryConfig: undefined,
      };

      const deps2: QueryManagerDependencies = {
        ...mockDependencies,
        queryConfig: null as unknown,
      };

      expect(() => {
        new QueryManager(deps1);
      }).not.toThrow();

      expect(() => {
        new QueryManager(deps2);
      }).not.toThrow();
    });

    it('should handle deeply nested configuration', async () => {
      const deepConfig: QueryClientConfig = {
        defaultOptions: {
          queries: {
            staleTime: 30000,
            gcTime: 300000,
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            refetchOnMount: true,
          },
          mutations: {
            retry: 1,
            retryDelay: 1000,
          },
        },
      };

      const deps: QueryManagerDependencies = {
        ...mockDependencies,
        queryConfig: deepConfig,
      };

      expect(() => {
        queryManager = new QueryManager(deps);
      }).not.toThrow();

      // Verify the deep config was merged properly
      const { QueryClient } = await import('@tanstack/query-core');
      expect(vi.mocked(QueryClient)).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultOptions: expect.objectContaining({
            queries: expect.objectContaining({
              staleTime: 30000,
              gcTime: 300000,
              retry: 3,
              refetchOnWindowFocus: true,
              refetchOnReconnect: true,
              refetchOnMount: true,
            }),
            mutations: expect.objectContaining({
              retry: 1,
              retryDelay: 1000,
            }),
          }),
        }),
      );
    });
  });
});
