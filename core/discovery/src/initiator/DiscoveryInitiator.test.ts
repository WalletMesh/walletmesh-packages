/**
 * Consolidated test suite for DiscoveryInitiator
 * Combines main functionality, additional edge cases, coverage improvements, and error handling tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DiscoveryInitiator } from './DiscoveryInitiator.js';
import { createTestDAppInfo, createTestDiscoveryResponse } from '../testing/testUtils.js';
import { MockEventTarget } from '../testing/MockEventTarget.js';
import { setupFakeTimers, cleanupFakeTimers, advanceTimeAndWait } from '../testing/timingHelpers.js';
import { createDiscoveryResponseEvent } from '../testing/eventHelpers.js';
import type {
  DiscoveryInitiatorConfig,
  DiscoveryResponseEvent,
  CapabilityRequirements,
} from '../core/types.js';
import { DISCOVERY_EVENTS, DISCOVERY_PROTOCOL_VERSION } from '../core/constants.js';
import type { InitiatorStateMachine } from './InitiatorStateMachine.js';

describe('DiscoveryInitiator', () => {
  let listener: DiscoveryInitiator;
  let mockEventTarget: MockEventTarget;
  let eventTarget: EventTarget;
  let defaultConfig: DiscoveryInitiatorConfig;

  beforeEach(() => {
    setupFakeTimers();
    mockEventTarget = new MockEventTarget();
    eventTarget = new EventTarget();

    defaultConfig = {
      initiatorInfo: createTestDAppInfo(),
      requirements: {
        chains: ['eip155:1'],
        features: ['account-management'],
        interfaces: ['eip-1193'],
      },
      eventTarget: mockEventTarget,
      timeout: 1000,
    };

    listener = new DiscoveryInitiator(defaultConfig);
  });

  afterEach(() => {
    cleanupFakeTimers();
    listener.stopDiscovery();
    vi.clearAllMocks();
  });

  // ===============================================
  // Basic Functionality Tests
  // ===============================================
  describe('Basic Functionality', () => {
    it('should initialize with correct default state', () => {
      expect(listener.getState()).toBe('IDLE');
      expect(listener.isDiscoveryInProgress()).toBe(false);
      expect(listener.getQualifiedResponders()).toEqual([]);
    });

    it('should start discovery successfully', async () => {
      const discoveryPromise = listener.startDiscovery();
      await advanceTimeAndWait(10);

      expect(listener.isDiscoveryInProgress()).toBe(true);
      expect(listener.getState()).toBe('DISCOVERING');

      await advanceTimeAndWait(1000);
      const wallets = await discoveryPromise;
      expect(wallets).toEqual([]);
    });

    it('should complete discovery with timeout', async () => {
      const discoveryPromise = listener.startDiscovery();
      await vi.advanceTimersByTimeAsync(1000);

      const wallets = await discoveryPromise;
      expect(wallets).toEqual([]);
      expect(listener.getState()).toBe('COMPLETED');
    });

    it('should stop discovery early', async () => {
      const discoveryPromise = listener.startDiscovery();
      await vi.advanceTimersByTimeAsync(10);

      expect(listener.isDiscoveryInProgress()).toBe(true);
      listener.stopDiscovery();

      await vi.advanceTimersByTimeAsync(100);
      const wallets = await discoveryPromise;
      expect(wallets).toEqual([]);
      expect(listener.isDiscoveryInProgress()).toBe(false);
    });

    it('should collect valid wallet responses', async () => {
      const discoveryPromise = listener.startDiscovery();
      await advanceTimeAndWait(10);

      const sessionId = listener.getCurrentSessionId();
      expect(sessionId).toBeTruthy();
      if (!sessionId) throw new Error('Session ID should be available');

      const response = createTestDiscoveryResponse({ sessionId });
      const event = createDiscoveryResponseEvent(response);
      mockEventTarget.dispatchEvent(event);

      await advanceTimeAndWait(1000);
      const wallets = await discoveryPromise;

      expect(wallets).toHaveLength(1);
      expect(wallets[0]?.name).toBe(response.name);
      expect(wallets[0]?.rdns).toBe(response.rdns);
    });
  });

  // ===============================================
  // State Management Tests
  // ===============================================
  describe('State Management', () => {
    it('should handle state queries when not discovering', () => {
      expect(listener.getState()).toBe('IDLE');
      expect(listener.isDiscoveryInProgress()).toBe(false);
    });

    it('should handle getQualifiedResponders when in wrong state', () => {
      const responders = listener.getQualifiedResponders();
      expect(responders).toEqual([]);
    });

    it('should handle state machine reset when not in DISCOVERING state', async () => {
      const discoveryPromise = listener.startDiscovery();
      await vi.advanceTimersByTimeAsync(10);

      const stateMachine = (
        listener as unknown as {
          stateMachine: {
            transition: (state: string, data?: unknown) => void;
            getState: () => string;
            isInState: (state: string) => boolean;
          };
        }
      ).stateMachine;

      stateMachine.transition('COMPLETED');
      await vi.advanceTimersByTimeAsync(1000);

      const wallets = await discoveryPromise;
      expect(wallets).toHaveLength(0);
      expect(stateMachine.isInState('COMPLETED')).toBe(true);
    });

    it('should only reset state machine if in DISCOVERING state after discovery', async () => {
      const listenerWithEventTarget = new DiscoveryInitiator({
        ...defaultConfig,
        eventTarget,
      });

      void listenerWithEventTarget.startDiscovery();
      expect(listenerWithEventTarget.getStats().currentState).toBe('DISCOVERING');

      const stateMachine = (
        listenerWithEventTarget as unknown as {
          stateMachine: { transition: (state: string) => void };
        }
      ).stateMachine;
      stateMachine.transition('COMPLETED');

      await vi.advanceTimersByTimeAsync(3001);
      expect(listenerWithEventTarget.getStats().currentState).toBe('COMPLETED');
    });

    it('should reset state machine when completing discovery from DISCOVERING state', async () => {
      const listenerWithEventTarget = new DiscoveryInitiator({
        ...defaultConfig,
        eventTarget,
      });

      const discoveryPromise = listenerWithEventTarget.startDiscovery();
      expect(listenerWithEventTarget.getStats().currentState).toBe('DISCOVERING');

      await vi.advanceTimersByTimeAsync(3001);
      await discoveryPromise;

      expect(listenerWithEventTarget.getStats().currentState).toBe('COMPLETED');
    });
  });

  // ===============================================
  // Configuration Tests
  // ===============================================
  describe('Configuration Management', () => {
    it('should update discovery configuration', () => {
      const newConfig: Partial<DiscoveryInitiatorConfig> = {
        timeout: 5000,
        preferences: {
          chains: ['eip155:137'],
          features: ['hardware-wallet'],
        },
      };

      listener.updateConfig(newConfig);

      const stats = listener.getStats();
      expect(stats.config.timeout).toBe(5000);
      expect(stats.config.preferencesCount?.chains).toBe(1);
      expect(stats.config.preferencesCount?.features).toBe(1);
    });

    it('should partially update configuration', () => {
      listener.updateConfig({ timeout: 8000 });

      const stats = listener.getStats();
      expect(stats.config.timeout).toBe(8000);
      expect(stats.config.requirementsCount.chains).toBe(1);
    });

    it('should update requirements in configuration', () => {
      const newRequirements: CapabilityRequirements = {
        chains: ['eip155:1', 'eip155:137'],
        features: ['account-management', 'transaction-signing'],
        interfaces: ['eip-1193', 'eip-6963'],
      };

      listener.updateConfig({ requirements: newRequirements });

      const stats = listener.getStats();
      expect(stats.config.requirementsCount.chains).toBe(2);
      expect(stats.config.requirementsCount.features).toBe(2);
      expect(stats.config.requirementsCount.interfaces).toBe(2);
    });

    it('should handle configuration with empty requirements', () => {
      const emptyRequirementsConfig: DiscoveryInitiatorConfig = {
        initiatorInfo: createTestDAppInfo(),
        requirements: {
          chains: [],
          features: [],
          interfaces: [],
        },
        eventTarget: mockEventTarget,
        timeout: 1000,
      };

      expect(() => new DiscoveryInitiator(emptyRequirementsConfig)).not.toThrow();
      const emptyListener = new DiscoveryInitiator(emptyRequirementsConfig);

      expect(() => emptyListener.startDiscovery()).not.toThrow();
      emptyListener.stopDiscovery();
    });

    it('should handle configuration with duplicate requirements', () => {
      const duplicateRequirementsConfig: DiscoveryInitiatorConfig = {
        initiatorInfo: createTestDAppInfo(),
        requirements: {
          chains: ['eip155:1', 'eip155:1', 'eip155:1'],
          features: ['account-management', 'account-management'],
          interfaces: ['eip-1193', 'eip-1193'],
        },
        eventTarget: mockEventTarget,
        timeout: 1000,
      };

      expect(() => new DiscoveryInitiator(duplicateRequirementsConfig)).not.toThrow();
    });
  });

  // ===============================================
  // Statistics Tests
  // ===============================================
  describe('Statistics', () => {
    it('should return null for preferences count when no preferences are set', () => {
      const stats = listener.getStats();
      expect(stats.config.preferencesCount).toBeNull();
    });

    it('should calculate preferences count correctly when preferences are set', () => {
      listener.updateConfig({
        preferences: {
          chains: ['eip155:137', 'eip155:42161'],
          features: ['hardware-wallet'],
        },
      });

      const stats = listener.getStats();
      expect(stats.config.preferencesCount).toEqual({
        chains: 2,
        features: 1,
      });
    });

    it('should handle partial preferences in count calculation', () => {
      listener.updateConfig({
        preferences: {
          chains: ['eip155:137'],
        },
      });

      const stats = listener.getStats();
      expect(stats.config.preferencesCount).toEqual({
        chains: 1,
        features: 0,
      });
    });

    it('should handle empty arrays in preferences count', () => {
      listener.updateConfig({
        preferences: {
          chains: [],
          features: [],
        },
      });

      const stats = listener.getStats();
      expect(stats.config.preferencesCount).toEqual({
        chains: 0,
        features: 0,
      });
    });
  });

  // ===============================================
  // Error Handling Tests
  // ===============================================
  describe('Error Handling', () => {
    it('should throw error when discovery is already in progress', async () => {
      const firstDiscovery = listener.startDiscovery();

      await expect(listener.startDiscovery()).rejects.toThrow('Discovery is already in progress');

      await vi.advanceTimersByTimeAsync(1000);
      await firstDiscovery;
    });

    it('should validate origin on incoming responses', async () => {
      const configWithPolicy: DiscoveryInitiatorConfig = {
        ...defaultConfig,
        securityPolicy: {
          allowedOrigins: ['https://allowed.com'],
          requireHttps: true,
        },
      };

      listener = new DiscoveryInitiator(configWithPolicy);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const discoveryPromise = listener.startDiscovery();
      await vi.advanceTimersByTimeAsync(10);

      const sessionId = listener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      // Create response from invalid origin
      const response = createTestDiscoveryResponse({ sessionId });
      const invalidEvent = new MessageEvent(DISCOVERY_EVENTS.RESPONSE, {
        data: response,
        origin: 'http://invalid.com',
      });

      mockEventTarget.dispatchEvent(invalidEvent);

      await vi.advanceTimersByTimeAsync(1000);
      const wallets = await discoveryPromise;

      expect(wallets).toHaveLength(0);
      expect(warnSpy).toHaveBeenCalledWith(
        '[WalletMesh] Discovery response from invalid origin:',
        'http://invalid.com',
      );
      warnSpy.mockRestore();
    });

    it('should handle event dispatch errors gracefully', async () => {
      const throwingEventTarget = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn().mockImplementation(() => {
          throw new Error('Event dispatch failed');
        }),
      } as unknown as EventTarget;

      listener = new DiscoveryInitiator({
        ...defaultConfig,
        eventTarget: throwingEventTarget,
      });

      // The error is caught and logged, but discovery continues
      const discoveryPromise = listener.startDiscovery();

      // Complete the discovery
      await vi.advanceTimersByTimeAsync(1000);

      // Should resolve with empty array since no responses
      const result = await discoveryPromise;
      expect(result).toEqual([]);
    });

    it('should handle error during discovery and still manage state correctly', async () => {
      const mockEventTarget = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi
          .fn()
          .mockImplementationOnce(() => {
            throw new Error('Event dispatch error');
          })
          .mockImplementation(() => true), // Subsequent calls succeed
      } as unknown as EventTarget;

      const listenerWithMockTarget = new DiscoveryInitiator({
        ...defaultConfig,
        eventTarget: mockEventTarget,
      });

      // Start discovery - first dispatch will fail but discovery continues
      const discoveryPromise = listenerWithMockTarget.startDiscovery();

      // State should still be DISCOVERING despite the error
      expect(listenerWithMockTarget.getStats().currentState).toBe('DISCOVERING');

      // Complete the discovery timeout
      await vi.advanceTimersByTimeAsync(1000);

      // Should complete successfully with empty results
      const result = await discoveryPromise;
      expect(result).toEqual([]);
      expect(listenerWithMockTarget.getStats().currentState).toBe('COMPLETED');
    });
  });

  // ===============================================
  // Response Validation Tests
  // ===============================================
  describe('Response Validation', () => {
    it('should ignore responses with missing required fields', async () => {
      const discoveryPromise = listener.startDiscovery();
      await vi.advanceTimersByTimeAsync(10);

      const invalidResponses = [
        { ...createTestDiscoveryResponse(), type: undefined },
        { ...createTestDiscoveryResponse(), version: undefined },
        { ...createTestDiscoveryResponse(), sessionId: undefined },
        { ...createTestDiscoveryResponse(), responderId: undefined },
        { ...createTestDiscoveryResponse(), rdns: undefined },
        { ...createTestDiscoveryResponse(), name: undefined },
        { ...createTestDiscoveryResponse(), icon: undefined },
        { ...createTestDiscoveryResponse(), matched: undefined },
      ];

      for (const response of invalidResponses) {
        const event = new CustomEvent(DISCOVERY_EVENTS.RESPONSE, {
          detail: response as unknown as DiscoveryResponseEvent,
        });
        mockEventTarget.dispatchEvent(event);
      }

      await vi.advanceTimersByTimeAsync(1000);
      const wallets = await discoveryPromise;

      expect(wallets).toHaveLength(0);
    });

    it('should ignore responses with wrong message type', async () => {
      const discoveryPromise = listener.startDiscovery();
      await vi.advanceTimersByTimeAsync(10);

      const sessionId = listener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      const wrongTypeResponse = {
        ...createTestDiscoveryResponse({ sessionId }),
        type: 'wallet:discovery:wrong-type',
      };

      const event = new CustomEvent(DISCOVERY_EVENTS.RESPONSE, {
        detail: wrongTypeResponse as unknown as DiscoveryResponseEvent,
      });
      mockEventTarget.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(1000);
      const wallets = await discoveryPromise;

      expect(wallets).toHaveLength(0);
    });

    it('should warn about protocol version mismatch', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const discoveryPromise = listener.startDiscovery();
      await vi.advanceTimersByTimeAsync(10);

      const sessionId = listener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      const wrongVersionResponse = {
        ...createTestDiscoveryResponse({ sessionId }),
        version: '0.2.0',
      };

      const event = new CustomEvent(DISCOVERY_EVENTS.RESPONSE, {
        detail: wrongVersionResponse,
      });
      mockEventTarget.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(1000);
      const wallets = await discoveryPromise;

      expect(wallets).toHaveLength(0);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Protocol version mismatch'));

      consoleWarnSpy.mockRestore();
    });

    it('should reject responses with invalid RDNS format', async () => {
      const discoveryPromise = listener.startDiscovery();
      await vi.advanceTimersByTimeAsync(10);

      const sessionId = listener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      const invalidRdnsResponses = [
        { ...createTestDiscoveryResponse({ sessionId }), rdns: '' },
        { ...createTestDiscoveryResponse({ sessionId }), rdns: '.com.wallet' },
        { ...createTestDiscoveryResponse({ sessionId }), rdns: 'com..wallet' },
        { ...createTestDiscoveryResponse({ sessionId }), rdns: 'com.wallet.' },
        { ...createTestDiscoveryResponse({ sessionId }), rdns: 'com wallet' },
        { ...createTestDiscoveryResponse({ sessionId }), rdns: 'a'.repeat(254) },
      ];

      for (const response of invalidRdnsResponses) {
        const event = new CustomEvent(DISCOVERY_EVENTS.RESPONSE, {
          detail: response,
        });
        mockEventTarget.dispatchEvent(event);
      }

      await vi.advanceTimersByTimeAsync(1000);
      const wallets = await discoveryPromise;

      expect(wallets).toHaveLength(0);
    });

    it('should reject responses with invalid icon format', async () => {
      const discoveryPromise = listener.startDiscovery();
      await vi.advanceTimersByTimeAsync(10);

      const sessionId = listener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      const invalidIconResponse = {
        ...createTestDiscoveryResponse({ sessionId }),
        icon: 'https://example.com/icon.png',
      };

      const event = new CustomEvent(DISCOVERY_EVENTS.RESPONSE, {
        detail: invalidIconResponse,
      });
      mockEventTarget.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(1000);
      const wallets = await discoveryPromise;

      expect(wallets).toHaveLength(0);
    });

    it('should ignore responses for wrong session ID', async () => {
      const discoveryPromise = listener.startDiscovery();
      await vi.advanceTimersByTimeAsync(10);

      const wrongSessionResponse = createTestDiscoveryResponse({
        sessionId: 'wrong-session-id',
      });

      const event = new CustomEvent(DISCOVERY_EVENTS.RESPONSE, {
        detail: wrongSessionResponse,
      });
      mockEventTarget.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(1000);
      const wallets = await discoveryPromise;

      expect(wallets).toHaveLength(0);
    });
  });

  // ===============================================
  // Event Processing Edge Cases
  // ===============================================
  describe('Event Processing Edge Cases', () => {
    it('should handle event without detail property', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const discoveryPromise = listener.startDiscovery();
      await vi.advanceTimersByTimeAsync(10);

      const eventWithoutDetail = new CustomEvent(DISCOVERY_EVENTS.RESPONSE, {});
      mockEventTarget.dispatchEvent(eventWithoutDetail);

      await vi.advanceTimersByTimeAsync(1000);
      const wallets = await discoveryPromise;

      expect(wallets).toHaveLength(0);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[WalletMesh] Error processing discovery response:',
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle responses with circular reference data', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const discoveryPromise = listener.startDiscovery();
      await vi.advanceTimersByTimeAsync(10);

      const sessionId = listener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      const circularResponse = createTestDiscoveryResponse({ sessionId });
      (circularResponse as { circular?: unknown }).circular = circularResponse;

      const event = new CustomEvent(DISCOVERY_EVENTS.RESPONSE, {
        detail: circularResponse,
      });

      mockEventTarget.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(1000);
      const wallets = await discoveryPromise;

      expect(wallets).toHaveLength(1);
      consoleWarnSpy.mockRestore();
    });

    it('should handle responses that arrive exactly at timeout', async () => {
      const discoveryPromise = listener.startDiscovery();
      await vi.advanceTimersByTimeAsync(10);

      const sessionId = listener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      await vi.advanceTimersByTimeAsync(989);
      expect(listener.isDiscoveryInProgress()).toBe(true);

      const response = createTestDiscoveryResponse({ sessionId });
      const event = new CustomEvent(DISCOVERY_EVENTS.RESPONSE, {
        detail: response,
      });

      mockEventTarget.dispatchEvent(event);
      await vi.advanceTimersByTimeAsync(1);

      const wallets = await discoveryPromise;
      expect(wallets).toHaveLength(1);
    });

    it('should handle responses after discovery stopped', async () => {
      const discoveryPromise = listener.startDiscovery();
      await vi.advanceTimersByTimeAsync(10);

      const sessionId = listener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      listener.stopDiscovery();

      const lateResponse = createTestDiscoveryResponse({ sessionId });
      const event = new CustomEvent(DISCOVERY_EVENTS.RESPONSE, {
        detail: lateResponse,
      });
      mockEventTarget.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(1000);

      const wallets = await discoveryPromise;
      expect(wallets).toHaveLength(0);
    });

    it('should handle responses with special characters in strings', async () => {
      const discoveryPromise = listener.startDiscovery();
      await vi.advanceTimersByTimeAsync(10);

      const sessionId = listener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      const specialCharResponse = createTestDiscoveryResponse({
        sessionId,
        name: 'Test\u0000\u001F\uFEFF\uFFFF',
        rdns: 'com.test\u00A0.wallet',
      });

      const event = new CustomEvent(DISCOVERY_EVENTS.RESPONSE, {
        detail: specialCharResponse,
      });

      mockEventTarget.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(1000);
      const wallets = await discoveryPromise;

      expect(wallets).toHaveLength(0);
    });
  });

  // ===============================================
  // Wallet Selection Tests
  // ===============================================
  describe('Wallet Selection', () => {
    it('should successfully collect wallet responses during DISCOVERING state', async () => {
      const listenerWithEventTarget = new DiscoveryInitiator({
        ...defaultConfig,
        eventTarget,
      });

      void listenerWithEventTarget.startDiscovery();

      const mockResponse = {
        type: DISCOVERY_EVENTS.RESPONSE,
        version: DISCOVERY_PROTOCOL_VERSION,
        sessionId: listenerWithEventTarget.getCurrentSessionId(),
        timestamp: Date.now(),
        responderId: 'test-wallet',
        rdns: 'com.test.wallet',
        name: 'Test Wallet',
        icon: 'data:image/png;base64,test',
        matched: {
          required: {
            chains: ['eip155:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
        },
      };

      const event = new CustomEvent(DISCOVERY_EVENTS.RESPONSE, {
        detail: mockResponse,
      });
      eventTarget.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(10);

      const stateMachine = (
        listenerWithEventTarget as unknown as {
          stateMachine: {
            getState: () => string;
          };
        }
      ).stateMachine;

      // Check current state - should be DISCOVERING
      const currentState = stateMachine.getState();
      expect(currentState).toBe('DISCOVERING');

      // Check that we can get responders (wallet was collected)
      const responders = listenerWithEventTarget.getQualifiedResponders();
      expect(responders.length).toBeGreaterThan(0);
      expect(responders[0]?.responderId).toBe('test-wallet');
    });
  });

  // ===============================================
  // Coverage Improvement Tests
  // ===============================================
  describe('Coverage Improvements', () => {
    it('should validate origin when security policy is provided (MessageEvent)', async () => {
      // Mock window.location.origin
      const originalWindow = globalThis.window;
      globalThis.window = {
        ...originalWindow,
        location: {
          ...originalWindow?.location,
          origin: 'https://trusted-dapp.com',
        },
      } as Window & typeof globalThis;

      const securityConfig = {
        ...defaultConfig,
        securityPolicy: {
          allowedOrigins: ['https://trusted-dapp.com'],
          requireHttps: true,
        },
      };

      const secureListener = new DiscoveryInitiator(securityConfig);
      const discoveryPromise = secureListener.startDiscovery();
      await vi.advanceTimersByTimeAsync(10);

      const sessionId = secureListener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      // Create response
      const response = createTestDiscoveryResponse({ sessionId });

      // Create MessageEvent with untrusted origin
      const untrustedEvent = new MessageEvent(DISCOVERY_EVENTS.RESPONSE, {
        data: response,
        origin: 'https://untrusted-dapp.com',
      });

      // Spy on console.warn
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Dispatch the event
      mockEventTarget.dispatchEvent(untrustedEvent);

      await vi.advanceTimersByTimeAsync(1000);
      const wallets = await discoveryPromise;

      // Should have rejected the response due to origin validation
      expect(wallets).toHaveLength(0);
      expect(warnSpy).toHaveBeenCalledWith(
        '[WalletMesh] Discovery response from invalid origin:',
        'https://untrusted-dapp.com',
      );

      warnSpy.mockRestore();

      // Restore window
      if (originalWindow) {
        globalThis.window = originalWindow;
      }
    });

    it('should accept response from allowed origin (MessageEvent)', async () => {
      // Mock window.location.origin
      const originalWindow = globalThis.window;
      globalThis.window = {
        ...originalWindow,
        location: {
          ...originalWindow?.location,
          origin: 'https://trusted-dapp.com',
        },
      } as Window & typeof globalThis;

      const securityConfig = {
        ...defaultConfig,
        securityPolicy: {
          allowedOrigins: ['https://trusted-dapp.com'],
          requireHttps: true,
        },
      };

      const secureListener = new DiscoveryInitiator(securityConfig);
      const discoveryPromise = secureListener.startDiscovery();
      await vi.advanceTimersByTimeAsync(10);

      const sessionId = secureListener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      // Create response
      const response = createTestDiscoveryResponse({ sessionId });

      // Create MessageEvent with trusted origin
      const trustedEvent = new MessageEvent(DISCOVERY_EVENTS.RESPONSE, {
        data: response,
        origin: 'https://trusted-dapp.com',
      });

      // Dispatch the event
      mockEventTarget.dispatchEvent(trustedEvent);

      await vi.advanceTimersByTimeAsync(1000);
      const wallets = await discoveryPromise;

      // Should have accepted the response
      expect(wallets).toHaveLength(1);

      // Restore window
      if (originalWindow) {
        globalThis.window = originalWindow;
      }
    });

    it('should include transport configuration when provided in response', async () => {
      const discoveryPromise = listener.startDiscovery();
      await vi.advanceTimersByTimeAsync(10);

      const sessionId = listener.getCurrentSessionId();
      if (!sessionId) throw new Error('No session ID');

      const responseWithTransport = createTestDiscoveryResponse({
        sessionId,
        transportConfig: {
          type: 'extension',
          extensionId: 'test-extension-id',
        },
      });

      const event = new CustomEvent(DISCOVERY_EVENTS.RESPONSE, {
        detail: responseWithTransport,
      });

      mockEventTarget.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(1000);
      const wallets = await discoveryPromise;

      expect(wallets).toHaveLength(1);
      expect(wallets[0]).toHaveProperty('transportConfig');
      expect(wallets[0]?.transportConfig).toEqual({
        type: 'extension',
        extensionId: 'test-extension-id',
      });
    });

    it('should use fallback origin when not in browser environment', () => {
      // Save original window
      const originalWindow = globalThis.window;

      // Remove window to simulate non-browser environment
      (globalThis as unknown as Record<string, unknown>)['window'] = undefined;

      const nonBrowserListener = new DiscoveryInitiator(defaultConfig);

      // Access private method through type assertion
      const privateListener = nonBrowserListener as unknown as {
        getOrigin(): string;
      };

      const origin = privateListener.getOrigin();
      expect(origin).toBe('http://localhost:3000');

      // Restore window
      if (originalWindow) {
        globalThis.window = originalWindow;
      }
    });

    it('should properly dispose resources including state machine', () => {
      // Start discovery first to initialize state machine
      listener.startDiscovery();
      expect(listener.isDiscoveryInProgress()).toBe(true);

      // Now spy on the dispose method
      const disposeSpy = vi.spyOn(listener['stateMachine'] as InitiatorStateMachine, 'dispose');

      // Dispose the listener
      listener.dispose();

      // Should have stopped discovery and disposed state machine
      expect(listener.isDiscoveryInProgress()).toBe(false);
      expect(disposeSpy).toHaveBeenCalled();
    });

    it('should clean up resources when disposed during active discovery', async () => {
      const discoveryPromise = listener.startDiscovery();
      await vi.advanceTimersByTimeAsync(10);

      expect(listener.isDiscoveryInProgress()).toBe(true);

      // Dispose while discovery is active
      listener.dispose();

      // Should have stopped discovery
      expect(listener.isDiscoveryInProgress()).toBe(false);

      // Complete the timer
      await vi.advanceTimersByTimeAsync(1000);

      // Should get empty results since we disposed
      const wallets = await discoveryPromise;
      expect(wallets).toHaveLength(0);
    });
  });
});
