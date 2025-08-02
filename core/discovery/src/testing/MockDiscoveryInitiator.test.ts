import { describe, it, expect, beforeEach } from 'vitest';
import { MockDiscoveryInitiator } from './MockDiscoveryInitiator.js';
import { createTestDAppInfo, createTestDiscoveryResponse } from './testUtils.js';
import type { DiscoveryInitiatorConfig, DiscoveryResponseEvent, QualifiedResponder } from '../core/types.js';
import { DISCOVERY_PROTOCOL_VERSION } from '../core/constants.js';

describe('MockDiscoveryInitiator - Error Simulation and Edge Cases', () => {
  let listener: MockDiscoveryInitiator;
  let defaultConfig: DiscoveryInitiatorConfig;

  beforeEach(() => {
    defaultConfig = {
      initiatorInfo: createTestDAppInfo(),
      requirements: {
        chains: ['eip155:1'],
        features: ['account-management'],
        interfaces: ['eip-1193'],
      },
    };
    listener = new MockDiscoveryInitiator(defaultConfig);
  });

  describe('Basic Functionality', () => {
    it('should initialize with correct state', () => {
      const stats = listener.getStats();
      expect(stats.isDiscovering).toBe(false);
      expect(stats.sessionId).toBeNull();
      expect(stats.qualifiedWalletsCount).toBe(0);
      expect(stats.qualifiedWallets).toHaveLength(0);
    });

    it('should start discovery process correctly', async () => {
      const wallets = await listener.startDiscovery();

      expect(listener.isDiscoveryInProgress()).toBe(true);
      expect(listener.getCurrentSessionId()).toBeTruthy();
      expect(wallets).toHaveLength(0); // No wallets added yet

      const lastRequest = listener.getLastRequest();
      expect(lastRequest).toBeDefined();
      expect(lastRequest?.initiatorInfo).toEqual(defaultConfig.initiatorInfo);
      expect(lastRequest?.required).toEqual(defaultConfig.requirements);
    });

    it('should stop discovery process correctly', async () => {
      await listener.startDiscovery();
      expect(listener.isDiscoveryInProgress()).toBe(true);

      listener.stopDiscovery();
      expect(listener.isDiscoveryInProgress()).toBe(false);
      expect(listener.getCurrentSessionId()).toBeNull();
    });
  });

  describe('Discovery Process', () => {
    it('should not allow concurrent discovery sessions', async () => {
      await listener.startDiscovery();

      // Try to start another discovery while one is in progress
      await expect(listener.startDiscovery()).rejects.toThrow('Discovery already in progress');

      expect(listener.isDiscoveryInProgress()).toBe(true);
    });

    it('should create unique session IDs for each discovery', async () => {
      const sessionIds = new Set<string>();

      for (let i = 0; i < 5; i++) {
        await listener.startDiscovery();
        const sessionId = listener.getCurrentSessionId();
        expect(sessionId).toBeTruthy();
        if (sessionId) {
          sessionIds.add(sessionId);
        }
        listener.stopDiscovery();
      }

      expect(sessionIds.size).toBe(5); // All session IDs should be unique
    });

    it('should include preferences when provided', async () => {
      const configWithPreferences: DiscoveryInitiatorConfig = {
        ...defaultConfig,
        preferences: {
          features: ['hardware-wallet'],
        },
      };

      listener = new MockDiscoveryInitiator(configWithPreferences);
      await listener.startDiscovery();

      const lastRequest = listener.getLastRequest();
      expect(lastRequest?.optional).toEqual(configWithPreferences.preferences);
    });
  });

  describe('Wallet Response Handling', () => {
    it('should add valid wallet responses', async () => {
      await listener.startDiscovery();
      const sessionId = listener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      const response = createTestDiscoveryResponse({
        sessionId,
        responderId: 'wallet-1',
        name: 'Test Wallet 1',
      });

      listener.addMockWalletResponse(response);

      const wallets = listener.getQualifiedResponders();
      expect(wallets).toHaveLength(1);
      const wallet = wallets[0];
      expect(wallet).toBeDefined();
      expect(wallet?.responderId).toBe('wallet-1');
      expect(wallet?.name).toBe('Test Wallet 1');
    });

    it('should reject responses with wrong session ID', async () => {
      await listener.startDiscovery();

      const response = createTestDiscoveryResponse({
        sessionId: 'wrong-session-id',
        responderId: 'wallet-1',
      });

      listener.addMockWalletResponse(response);

      const wallets = listener.getQualifiedResponders();
      expect(wallets).toHaveLength(0);
    });

    it('should handle multiple wallet responses', async () => {
      await listener.startDiscovery();
      const sessionId = listener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      const responses = [
        createTestDiscoveryResponse({ sessionId, responderId: 'wallet-1', name: 'Wallet 1' }),
        createTestDiscoveryResponse({ sessionId, responderId: 'wallet-2', name: 'Wallet 2' }),
        createTestDiscoveryResponse({ sessionId, responderId: 'wallet-3', name: 'Wallet 3' }),
      ];

      for (const response of responses) {
        listener.addMockWalletResponse(response);
      }

      const wallets = listener.getQualifiedResponders();
      expect(wallets).toHaveLength(3);
      expect(wallets.map((w) => w.responderId)).toEqual(['wallet-1', 'wallet-2', 'wallet-3']);
    });

    it('should preserve metadata from wallet responses', async () => {
      await listener.startDiscovery();
      const sessionId = listener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      const response = createTestDiscoveryResponse({
        sessionId,
        responderId: 'wallet-1',
        responderVersion: '2.0.0',
        description: 'A test wallet',
      });

      listener.addMockWalletResponse(response);

      const wallets = listener.getQualifiedResponders();
      expect(wallets).toHaveLength(1);
      const wallet = wallets[0];
      if (!wallet || !wallet.metadata) throw new Error('No wallet or metadata');
      // Note: responderVersion is not stored in metadata, only protocol version is stored as 'version'
      expect(wallet.metadata['version']).toBe(DISCOVERY_PROTOCOL_VERSION);
      expect(wallet.metadata['description']).toBe('A test wallet');
    });
  });

  describe('Session Management', () => {
    it('should allow manual session ID setting for testing', () => {
      const customSessionId = 'custom-session-123';
      listener.setSessionId(customSessionId);

      expect(listener.getCurrentSessionId()).toBe(customSessionId);
      expect(listener.isDiscoveryInProgress()).toBe(true);
    });

    it('should clear session on stop', async () => {
      await listener.startDiscovery();
      const sessionId = listener.getCurrentSessionId();
      expect(sessionId).toBeTruthy();

      listener.stopDiscovery();
      expect(listener.getCurrentSessionId()).toBeNull();
    });

    it('should not accept responses when not discovering', () => {
      const response = createTestDiscoveryResponse({
        sessionId: 'any-session',
      });

      listener.addMockWalletResponse(response);

      expect(listener.getQualifiedResponders()).toHaveLength(0);
    });
  });

  describe('State Management', () => {
    it('should reset all state correctly', async () => {
      // Add some state
      await listener.startDiscovery();
      const sessionId = listener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      const response = createTestDiscoveryResponse({ sessionId });
      listener.addMockWalletResponse(response);

      expect(listener.getQualifiedResponders()).toHaveLength(1);
      expect(listener.getLastRequest()).toBeDefined();

      // Reset
      listener.reset();

      expect(listener.isDiscoveryInProgress()).toBe(false);
      expect(listener.getCurrentSessionId()).toBeNull();
      expect(listener.getQualifiedResponders()).toHaveLength(0);
      expect(listener.getLastRequest()).toBeUndefined();
    });

    it('should maintain separate wallet lists for different sessions', async () => {
      // First session
      await listener.startDiscovery();
      const sessionId1 = listener.getCurrentSessionId();
      if (!sessionId1) throw new Error('No session ID');
      listener.addMockWalletResponse(
        createTestDiscoveryResponse({
          sessionId: sessionId1,
          responderId: 'wallet-1',
        }),
      );

      expect(listener.getQualifiedResponders()).toHaveLength(1);

      // Stop and start new session
      listener.stopDiscovery();
      await listener.startDiscovery();
      const sessionId2 = listener.getCurrentSessionId();
      if (!sessionId2) throw new Error('No session ID');

      // Previous session's wallet response should not be accepted
      listener.addMockWalletResponse(
        createTestDiscoveryResponse({
          sessionId: sessionId1,
          responderId: 'wallet-2',
        }),
      );

      expect(listener.getQualifiedResponders()).toHaveLength(0); // New session, no wallets yet

      // Add wallet for new session
      listener.addMockWalletResponse(
        createTestDiscoveryResponse({
          sessionId: sessionId2,
          responderId: 'wallet-3',
        }),
      );

      const finalWallets = listener.getQualifiedResponders();
      expect(finalWallets).toHaveLength(1);
      const finalWallet = finalWallets[0];
      expect(finalWallet).toBeDefined();
      expect(finalWallet?.responderId).toBe('wallet-3');
    });
  });

  describe('Statistics and Debugging', () => {
    it('should provide comprehensive statistics', async () => {
      await listener.startDiscovery();
      const sessionId = listener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      // Add some wallets
      for (let i = 0; i < 3; i++) {
        listener.addMockWalletResponse(
          createTestDiscoveryResponse({
            sessionId,
            responderId: `wallet-${i}`,
          }),
        );
      }

      const stats = listener.getStats();

      expect(stats.isDiscovering).toBe(true);
      expect(stats.sessionId).toBe(sessionId);
      expect(stats.qualifiedWalletsCount).toBe(3);
      expect(stats.qualifiedWallets).toHaveLength(3);
      expect(stats.eventTargetStats).toBeDefined();
    });

    it('should return defensive copies of wallet lists', async () => {
      await listener.startDiscovery();
      const sessionId = listener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      listener.addMockWalletResponse(createTestDiscoveryResponse({ sessionId }));

      const wallets1 = listener.getQualifiedResponders();
      const wallets2 = listener.getQualifiedResponders();

      expect(wallets1).not.toBe(wallets2); // Different array instances
      expect(wallets1).toEqual(wallets2); // Same content

      // Modifying returned array should not affect internal state
      wallets1.push({} as unknown as QualifiedResponder);
      expect(listener.getQualifiedResponders()).toHaveLength(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid start/stop cycles', async () => {
      for (let i = 0; i < 10; i++) {
        await listener.startDiscovery();
        listener.stopDiscovery();
      }

      expect(listener.isDiscoveryInProgress()).toBe(false);
      expect(listener.getCurrentSessionId()).toBeNull();
    });

    it('should handle empty requirements', async () => {
      const emptyConfig: DiscoveryInitiatorConfig = {
        initiatorInfo: createTestDAppInfo(),
        requirements: {
          chains: [],
          features: [],
          interfaces: [],
        },
      };

      listener = new MockDiscoveryInitiator(emptyConfig);
      await listener.startDiscovery();

      const lastRequest = listener.getLastRequest();
      expect(lastRequest?.required.chains).toHaveLength(0);
      expect(lastRequest?.required.features).toHaveLength(0);
      expect(lastRequest?.required.interfaces).toHaveLength(0);
    });

    it('should handle very large number of wallet responses', async () => {
      await listener.startDiscovery();
      const sessionId = listener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      // Add 100 wallet responses
      for (let i = 0; i < 100; i++) {
        listener.addMockWalletResponse(
          createTestDiscoveryResponse({
            sessionId,
            responderId: `wallet-${i}`,
          }),
        );
      }

      const wallets = listener.getQualifiedResponders();
      expect(wallets).toHaveLength(100);
      const firstWallet = wallets[0];
      const lastWallet = wallets[99];
      expect(firstWallet).toBeDefined();
      expect(lastWallet).toBeDefined();
      expect(firstWallet?.responderId).toBe('wallet-0');
      expect(lastWallet?.responderId).toBe('wallet-99');
    });

    it('should handle malformed responses gracefully', async () => {
      await listener.startDiscovery();
      const sessionId = listener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      // Response missing required fields
      const malformedResponse = {
        sessionId,
        type: 'discovery:wallet:response',
        version: DISCOVERY_PROTOCOL_VERSION,
        // Missing required fields like responderId, rdns, name, etc.
      } as DiscoveryResponseEvent;

      expect(() => {
        listener.addMockWalletResponse(malformedResponse);
      }).not.toThrow();

      // The wallet might be added with undefined fields
      const wallets = listener.getQualifiedResponders();
      if (wallets.length > 0) {
        const firstWallet = wallets[0];
        expect(firstWallet).toBeDefined();
        expect(firstWallet?.responderId).toBeUndefined();
      }
    });

    it('should handle concurrent operations safely', async () => {
      await listener.startDiscovery();
      const sessionId = listener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      // Simulate concurrent operations
      const operations = [
        () => listener.addMockWalletResponse(createTestDiscoveryResponse({ sessionId })),
        () => listener.getQualifiedResponders(),
        () => listener.getStats(),
        () => listener.isDiscoveryInProgress(),
        () => listener.getCurrentSessionId(),
      ];

      // Execute all operations without errors
      for (const op of operations) {
        expect(() => op()).not.toThrow();
      }
    });

    it('should handle stop during response processing', async () => {
      await listener.startDiscovery();
      const sessionId = listener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      // Add a response
      listener.addMockWalletResponse(
        createTestDiscoveryResponse({
          sessionId,
          responderId: 'wallet-1',
        }),
      );

      // Stop discovery
      listener.stopDiscovery();

      // Try to add another response
      listener.addMockWalletResponse(
        createTestDiscoveryResponse({
          sessionId,
          responderId: 'wallet-2',
        }),
      );

      // Should only have the first wallet
      const wallets = listener.getQualifiedResponders();
      expect(wallets).toHaveLength(1);
      const firstWallet = wallets[0];
      expect(firstWallet).toBeDefined();
      expect(firstWallet?.responderId).toBe('wallet-1');
    });
  });

  describe('Event Target Integration', () => {
    it('should provide access to event target', () => {
      const eventTarget = listener.getEventTarget();
      expect(eventTarget).toBeDefined();
      expect(eventTarget.getStats).toBeDefined();
    });

    it('should clear event target on reset', async () => {
      const eventTarget = listener.getEventTarget();

      // Add some event listeners (simulated)
      eventTarget.addEventListener('test', () => {});

      await listener.startDiscovery();
      listener.reset();

      const stats = eventTarget.getStats();
      expect(stats.totalListeners).toBe(0);
      expect(stats.dispatchedEventsCount).toBe(0);
    });
  });
});
