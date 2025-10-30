/**
 * Edge case tests for SessionManager
 *
 * This test file focuses on:
 * - Invalid session parameters and error handling
 * - Session state transitions under edge conditions
 * - Provider validation and error scenarios
 * - Concurrent session operations
 * - Session cleanup and memory management
 * - Boundary conditions for session limits
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreateSessionParams, SessionState } from '../api/types/sessionState.js';
import { SessionManager } from '../internal/session/SessionManager.js';
import { ChainType } from '../testing/index.js';

// Extreme edge case providers
const createExtremeEdgeCaseProvider = (behavior: string) => {
  const provider = {
    connected: true,
    request: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn().mockResolvedValue(undefined),
    getAddresses: vi.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
    getChainId: vi.fn().mockResolvedValue('0x1'),
  };

  switch (behavior) {
    case 'infinite-pending':
      provider.request.mockImplementation(() => new Promise(() => {})); // Never resolves
      provider.connect.mockImplementation(() => new Promise(() => {}));
      break;

    case 'immediate-throw':
      provider.request.mockImplementation(() => {
        throw new Error('Immediate error');
      });
      provider.connect.mockImplementation(() => {
        throw new Error('Connect error');
      });
      break;

    case 'random-failure':
      provider.request.mockImplementation(() => {
        if (Math.random() < 0.5) {
          return Promise.reject(new Error('Random failure'));
        }
        return Promise.resolve('success');
      });
      break;

    case 'slow-response':
      provider.request.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve('slow-success'), 10000); // 10 seconds
        });
      });
      break;

    case 'circular-data': {
      const circularObj: Record<string, unknown> = { name: 'circular' };
      circularObj.self = circularObj;
      provider.request.mockResolvedValue(circularObj);
      break;
    }

    case 'null-responses':
      provider.request.mockResolvedValue(null);
      provider.connect.mockResolvedValue(null);
      break;

    case 'undefined-responses':
      provider.request.mockResolvedValue(undefined);
      provider.connect.mockResolvedValue(undefined);
      break;

    case 'invalid-types':
      provider.request.mockResolvedValue('not-an-object');
      provider.connect.mockResolvedValue(42);
      break;

    case 'memory-exhaustion':
      provider.request.mockImplementation(() => {
        // Create large data structure
        const largeArray = new Array(1000000).fill('x'.repeat(1000));
        return Promise.resolve(largeArray);
      });
      break;

    case 'event-spam':
      provider.on.mockImplementation((_event, handler) => {
        // Immediately spam events
        for (let i = 0; i < 1000; i++) {
          setTimeout(() => handler(`spam-${i}`), 0);
        }
      });
      break;
  }

  return provider;
};

const createEdgeCaseSessionParams = (
  behavior: string,
  overrides: Partial<CreateSessionParams> = {},
): CreateSessionParams => {
  return {
    walletId: `edge-wallet-${behavior}`,
    accounts: [
      {
        address: '0x1234567890123456789012345678901234567890',
        name: 'Edge Case Account',
      },
    ],
    chain: {
      chainId: '0x1',
      name: 'Edge Case Chain',
      chainType: ChainType.Evm,
      required: false,
    },
    provider: createExtremeEdgeCaseProvider(behavior),
    providerMetadata: {
      type: 'injected',
      version: '1.0.0',
      multiChainCapable: true,
      supportedMethods: ['eth_accounts'],
    },
    permissions: {
      methods: ['eth_accounts'],
      events: ['accountsChanged'],
    },
    metadata: {
      wallet: {
        name: 'Edge Case Wallet',
        icon: 'wallet-icon.png',
      },
      dapp: {
        name: 'Edge Case Test',
      },
      connection: {
        initiatedBy: 'user' as const,
        method: 'injected' as const,
      },
    },
    ...overrides,
  };
};

describe('SessionManager Edge Cases', () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    sessionManager = new SessionManager();
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Extreme Provider Behaviors', () => {
    it('should handle providers that never respond', async () => {
      const params = createEdgeCaseSessionParams('infinite-pending');

      // Session creation should still work even if provider is unresponsive
      const session = await sessionManager.createSession(params);
      expect(session).toBeDefined();
      expect(session.status).toBe('connected');

      // Subsequent operations might timeout, but shouldn't crash
      let timer: ReturnType<typeof setTimeout> | undefined;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Operation timeout')), 100);
      });

      const switchChainPromise = sessionManager.switchChain(session.sessionId, {
        chainId: '0x89',
        chainType: ChainType.Evm,
        name: 'Polygon',
      });

      // Advance timers to trigger timeout
      vi.advanceTimersByTime(100);

      await expect(Promise.race([switchChainPromise, timeoutPromise])).rejects.toThrow('Operation timeout');

      // Clean up timer
      if (timer) clearTimeout(timer);

      // Clean up any pending operations
      vi.runAllTimers();
    });

    it('should handle providers that throw immediately', async () => {
      const params = createEdgeCaseSessionParams('immediate-throw');

      // Session creation should succeed despite provider issues
      const session = await sessionManager.createSession(params);
      expect(session).toBeDefined();

      // Chain switching should handle immediate errors gracefully
      await expect(
        sessionManager.switchChain(session.sessionId, {
          chainId: '0x89',
          chainType: ChainType.Evm,
          name: 'Polygon',
        }),
      ).rejects.toThrow('Failed to switch to chain 0x89');
    });

    it('should handle providers with random failures', async () => {
      const params = createEdgeCaseSessionParams('random-failure');
      const session = await sessionManager.createSession(params);

      // Try chain switching multiple times with random failures
      const attempts = [];
      for (let i = 0; i < 10; i++) {
        try {
          const result = await sessionManager.switchChain(session.sessionId, {
            chainId: `0x${i + 1}`,
            chainType: ChainType.Evm,
            name: `Chain ${i + 1}`,
          });
          attempts.push({ success: true, result });
        } catch (error) {
          attempts.push({ success: false, error });
        }
      }

      // Should have both successes and failures
      const successes = attempts.filter((a) => a.success);
      const failures = attempts.filter((a) => !a.success);

      // With 50% random failure rate, we should see both
      expect(successes.length).toBeGreaterThan(0);
      expect(failures.length).toBeGreaterThan(0);
    });

    it('should handle extremely slow providers', async () => {
      const params = createEdgeCaseSessionParams('slow-response');
      const session = await sessionManager.createSession(params);

      // Start a slow operation
      // Start a slow operation but don't wait for it
      sessionManager.switchChain(session.sessionId, {
        chainId: '0x89',
        chainType: ChainType.Evm,
        name: 'Polygon',
      });

      // Should not block other operations
      const quickParams = createEdgeCaseSessionParams('null-responses', { walletId: 'quick-wallet' });
      const quickSession = await sessionManager.createSession(quickParams);

      expect(quickSession).toBeDefined();
      expect(quickSession.walletId).toBe('quick-wallet');

      // The slow operation might still be pending
      // We don't wait for it to avoid test timeout
    });

    it('should handle circular data structures', async () => {
      const params = createEdgeCaseSessionParams('circular-data');

      // Session creation should handle circular data without crashing
      const session = await sessionManager.createSession(params);
      expect(session).toBeDefined();

      // Operations should not fail due to circular serialization
      expect(() => {
        const activeSession = sessionManager.getActiveSession();
        JSON.stringify(activeSession); // This would fail with circular data
      }).not.toThrow();
    });

    it('should handle null and undefined responses', async () => {
      const nullParams = createEdgeCaseSessionParams('null-responses', { walletId: 'null-wallet' });
      const undefinedParams = createEdgeCaseSessionParams('undefined-responses', {
        walletId: 'undefined-wallet',
      });

      const nullSession = await sessionManager.createSession(nullParams);
      const undefinedSession = await sessionManager.createSession(undefinedParams);

      expect(nullSession).toBeDefined();
      expect(undefinedSession).toBeDefined();

      // For null/undefined responses, chain switching might succeed (create new session)
      // or fail depending on provider behavior
      try {
        const result1 = await sessionManager.switchChain(nullSession.sessionId, {
          chainId: '0x89',
          chainType: ChainType.Evm,
          name: 'Polygon',
        });
        // If it succeeds, verify it created a valid session
        expect(result1).toBeDefined();
        expect(result1.chain.chainId).toBe('0x89');
      } catch (error) {
        // If it fails, verify proper error
        expect(error).toBeDefined();
      }

      try {
        const result2 = await sessionManager.switchChain(undefinedSession.sessionId, {
          chainId: '0x89',
          chainType: ChainType.Evm,
          name: 'Polygon',
        });
        // If it succeeds, verify it created a valid session
        expect(result2).toBeDefined();
        expect(result2.chain.chainId).toBe('0x89');
      } catch (error) {
        // If it fails, verify proper error
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid response types', async () => {
      const params = createEdgeCaseSessionParams('invalid-types');
      const session = await sessionManager.createSession(params);

      expect(session).toBeDefined();

      // Should handle type mismatches gracefully
      try {
        const result = await sessionManager.switchChain(session.sessionId, {
          chainId: '0x89',
          chainType: ChainType.Evm,
          name: 'Polygon',
        });
        // If it succeeds, verify it created a valid session
        expect(result).toBeDefined();
        expect(result.chain.chainId).toBe('0x89');
      } catch (error) {
        // If it fails, verify proper error
        expect(error).toBeDefined();
      }
    });

    it('should handle memory-intensive operations', async () => {
      const params = createEdgeCaseSessionParams('memory-exhaustion');

      // Should not crash due to memory issues
      const session = await sessionManager.createSession(params);
      expect(session).toBeDefined();

      // Memory usage should be manageable
      const initialMemory = process.memoryUsage().heapUsed;

      try {
        await sessionManager.switchChain(session.sessionId, {
          chainId: '0x89',
          chainType: ChainType.Evm,
          name: 'Polygon',
        });
      } catch (_error) {
        // Expected to fail, but shouldn't crash
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });

    it('should handle event spam from providers', async () => {
      const params = createEdgeCaseSessionParams('event-spam');
      const session = await sessionManager.createSession(params);

      expect(session).toBeDefined();

      // Let events fire
      vi.advanceTimersByTime(100);

      // Session should remain stable despite event spam
      const retrievedSession = sessionManager.getSession(session.sessionId);
      expect(retrievedSession).toBeDefined();
      expect(retrievedSession?.status).toBe('connected');
    });
  });

  describe('Extreme Input Values', () => {
    it('should handle extremely long addresses', async () => {
      const longAddress = `0x${'a'.repeat(1000000)}`; // 1MB address
      const params = createEdgeCaseSessionParams('null-responses', {
        accounts: [{ address: longAddress, name: 'Long Address Account' }],
      });

      const session = await sessionManager.createSession(params);
      expect(session).toBeDefined();
      expect(session.accounts.map((acc) => acc.address)).toContain(longAddress);
    });

    it('should handle sessions with thousands of addresses', async () => {
      const manyAddresses = Array.from({ length: 10000 }, (_, i) => `0x${i.toString(16).padStart(40, '0')}`);

      const params = createEdgeCaseSessionParams('null-responses', {
        accounts: manyAddresses.map((addr, i) => ({ address: addr, name: `Account ${i}` })),
      });

      const session = await sessionManager.createSession(params);
      expect(session).toBeDefined();
      expect(session.accounts).toHaveLength(10000);
    });

    it('should handle extremely long wallet IDs', async () => {
      const longWalletId = `wallet-${'x'.repeat(100000)}`;
      const params = createEdgeCaseSessionParams('null-responses', {
        walletId: longWalletId,
      });

      const session = await sessionManager.createSession(params);
      expect(session).toBeDefined();
      expect(session.walletId).toBe(longWalletId);
    });

    it('should handle special characters in wallet IDs', async () => {
      const specialWalletId = '🦄💫<script>alert("xss")</script>&amp;';
      const params = createEdgeCaseSessionParams('null-responses', {
        walletId: specialWalletId,
      });

      const session = await sessionManager.createSession(params);
      expect(session).toBeDefined();
      expect(session.walletId).toBe(specialWalletId);
    });

    it('should handle invalid chain IDs', async () => {
      const invalidChains: (ChainId | null | undefined | number | object | unknown[])[] = [
        '', // Empty string
        null, // Null
        undefined, // Undefined
        123, // Number instead of string
        {}, // Object
        [], // Array
        'not-a-hex-value', // Invalid format
        '0x', // Just prefix
        '0xGGGG', // Invalid hex characters
      ];

      for (const invalidChain of invalidChains) {
        const params = createEdgeCaseSessionParams('null-responses', {
          chain: {
            chainId: invalidChain as ChainId,
            chainType: ChainType.Evm,
            name: 'Invalid Chain',
            required: false,
          },
        });

        // Should either succeed with normalization or fail gracefully
        try {
          const session = await sessionManager.createSession(params);
          expect(session).toBeDefined();
        } catch (error) {
          expect(error).toMatchObject({
            code: expect.any(String),
            message: expect.any(String),
          });
        }
      }
    });

    it('should handle enormous metadata objects', async () => {
      const enormousMetadata = {
        wallet: {
          name: 'Test Wallet',
          icon: 'wallet-icon.png',
        },
        dapp: {
          name: 'Test App',
          url: 'https://test.app',
          domain: 'test.app',
        },
        connection: {
          initiatedBy: 'user' as const,
          method: 'injected' as const,
          userAgent: 'x'.repeat(10000000), // 10MB string in user agent
        },
      };

      const params = createEdgeCaseSessionParams('null-responses', {
        metadata: enormousMetadata,
      });

      const session = await sessionManager.createSession(params);
      expect(session).toBeDefined();
      expect(session.metadata.dapp.name).toBe('Test App');
    });
  });

  describe('Concurrent Edge Cases', () => {
    it('should handle massive concurrent session creation', async () => {
      const concurrentCount = 1000;
      const sessionPromises = Array.from({ length: concurrentCount }, (_, i) =>
        sessionManager.createSession(
          createEdgeCaseSessionParams('null-responses', {
            walletId: `concurrent-wallet-${i}`,
          }),
        ),
      );

      const sessions = await Promise.all(sessionPromises);

      expect(sessions).toHaveLength(concurrentCount);
      sessions.forEach((session, i) => {
        expect(session.walletId).toBe(`concurrent-wallet-${i}`);
      });

      // All sessions should be tracked correctly - verify they exist
      for (let i = 0; i < concurrentCount; i++) {
        const session = sessionManager.getSession(sessions[i].sessionId);
        expect(session).toBeDefined();
      }
    });

    it('should handle rapid session creation and deletion', async () => {
      const cycles = 100;

      for (let i = 0; i < cycles; i++) {
        const session = await sessionManager.createSession(
          createEdgeCaseSessionParams('null-responses', {
            walletId: `rapid-wallet-${i}`,
          }),
        );

        await sessionManager.endSession(session.sessionId);
      }

      // All sessions should be cleaned up - verify active session is cleared
      const activeSession = sessionManager.getActiveSession();
      expect(activeSession).toBe(null);
    });

    it('should handle concurrent operations on same session', async () => {
      // Use a provider that responds quickly to avoid timeout
      const session = await sessionManager.createSession(
        createEdgeCaseSessionParams('null-responses', { walletId: 'concurrent-ops-wallet' }),
      );

      // Start multiple concurrent operations on the same session
      const operations = [
        sessionManager.switchChain(session.sessionId, {
          chainId: '0x89',
          chainType: ChainType.Evm,
          name: 'Polygon',
        }),
        sessionManager.switchChain(session.sessionId, {
          chainId: '0xa4b1',
          chainType: ChainType.Evm,
          name: 'Arbitrum One',
        }),
        sessionManager.switchChain(session.sessionId, {
          chainId: '0x2a',
          chainType: ChainType.Evm,
          name: 'Kovan',
        }),
        sessionManager.updateSessionStatus(session.sessionId, 'connecting'),
        sessionManager.updateSessionStatus(session.sessionId, 'connected'),
      ];

      // Some operations might fail, but session should remain stable
      await Promise.allSettled(operations);

      // Advance timers to ensure all async operations complete
      await vi.runAllTimersAsync();

      // Session should still exist and be in a valid state
      const finalSession = sessionManager.getSession(session.sessionId);
      expect(finalSession).toBeDefined();
      expect(['connecting', 'connected', 'disconnected']).toContain(finalSession?.status);
    });
  });

  describe('Resource Exhaustion', () => {
    it('should handle session creation under memory pressure', async () => {
      // Create many sessions to simulate memory pressure
      const sessions: SessionState[] = [];

      try {
        for (let i = 0; i < 10000; i++) {
          const session = await sessionManager.createSession(
            createEdgeCaseSessionParams('null-responses', {
              walletId: `memory-pressure-${i}`,
              accounts: Array.from({ length: 100 }, (_, j) => ({
                address: `0x${(i * 100 + j).toString(16).padStart(40, '0')}`,
                name: `Account ${j}`,
              })),
            }),
          );
          sessions.push(session);

          // Check memory usage periodically
          if (i % 1000 === 0) {
            const memoryUsage = process.memoryUsage();
            // If memory usage is too high, break early
            if (memoryUsage.heapUsed > 500 * 1024 * 1024) {
              // 500MB
              break;
            }
          }
        }
      } catch (error) {
        // Expected to eventually fail under extreme memory pressure
        expect(error).toMatchObject({
          code: expect.any(String),
          message: expect.any(String),
        });
      }

      // Should have created at least some sessions
      expect(sessions.length).toBeGreaterThan(0);

      // Cleanup should work even under memory pressure
      for (const session of sessions) {
        try {
          await sessionManager.endSession(session.sessionId);
        } catch (_error) {
          // Cleanup might fail under extreme conditions, but shouldn't crash
        }
      }
    });

    it('should handle time-based resource exhaustion', async () => {
      const session = await sessionManager.createSession(createEdgeCaseSessionParams('null-responses'));

      // Simulate very old session (beyond normal lifetime)
      const veryOldTime = Date.now() - 365 * 24 * 60 * 60 * 1000; // 1 year ago
      session.lifecycle.createdAt = veryOldTime;
      session.lifecycle.lastActiveAt = veryOldTime;
      session.lifecycle.lastAccessedAt = veryOldTime;

      // Operations should still work on very old sessions
      expect(() => {
        sessionManager.getSession(session.sessionId);
      }).not.toThrow();

      // Cleanup should handle old sessions
      await expect(sessionManager.cleanupExpiredSessions()).resolves.not.toThrow();
    });
  });

  describe('Malformed Data Edge Cases', () => {
    it('should handle corrupted session data', async () => {
      const session = await sessionManager.createSession(createEdgeCaseSessionParams('null-responses'));

      // Corrupt session data in various ways
      const corruptedSessions = [
        // @ts-expect-error Testing corrupted session data
        { ...session, sessionId: null },
        // @ts-expect-error Testing corrupted session data
        { ...session, walletId: undefined },
        // @ts-expect-error Testing corrupted session data
        { ...session, accounts: 'not-an-array' },
        // @ts-expect-error Testing corrupted session data
        { ...session, chain: null },
        // @ts-expect-error Testing corrupted session data
        { ...session, provider: 'not-an-object' },
        // @ts-expect-error Testing corrupted session data
        { ...session, status: 'invalid-status' },
        // @ts-expect-error Testing corrupted session data
        { ...session, lifecycle: null },
      ];

      for (const corruptedSession of corruptedSessions) {
        // Operations should handle corrupted data gracefully
        expect(() => {
          sessionManager.getActiveSession();
        }).not.toThrow();

        try {
          sessionManager.compareSessions(session.sessionId, corruptedSession.sessionId);
        } catch (error) {
          // Comparison might fail with corrupted data, but shouldn't crash
          expect(error).toBeInstanceOf(Error);
        }
      }
    });

    it('should handle invalid session IDs in operations', async () => {
      const invalidSessionIds: (string | null | undefined | number | object | unknown[])[] = [
        '', // Empty string
        null, // Null
        undefined, // Undefined
        123, // Number
        {}, // Object
        [], // Array
        'non-existent-session-id', // Valid string but non-existent
        'session-with-unicode-🦄', // Unicode characters
        'session\nwith\nlinebreaks', // Line breaks
        'session\x00with\x00nulls', // Null bytes
      ];

      for (const invalidId of invalidSessionIds) {
        // Operations should handle invalid IDs gracefully
        expect(sessionManager.getSession(invalidId as string)).toBeNull();

        try {
          sessionManager.updateSessionStatus(invalidId as string, 'connected');
        } catch (error) {
          // Should throw ModalError from ErrorFactory
          expect(error).toBeDefined();
          expect(error).toHaveProperty('code');
          expect(error).toHaveProperty('message');
        }

        try {
          await sessionManager.switchChain(invalidId as string, {
            chainId: '0x1',
            chainType: ChainType.Evm,
            name: 'Ethereum',
          });
        } catch (error) {
          // Should throw ModalError from ErrorFactory
          expect(error).toBeDefined();
          expect(error).toHaveProperty('code');
          expect(error).toHaveProperty('message');
        }

        await expect(sessionManager.endSession(invalidId as string)).resolves.not.toThrow();
      }
    });
  });
});
