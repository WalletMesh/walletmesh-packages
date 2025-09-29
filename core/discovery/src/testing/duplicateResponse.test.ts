/**
 * Test duplicate response detection in DiscoveryInitiator.
 *
 * Tests the "first response wins" security model where duplicate responses
 * from the same responder are detected and logged as suspicious activity.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DiscoveryInitiator } from '../initiator.js';
import { DuplicateResponseError } from '../types/core.js';
import { MockEventTarget } from './MockEventTarget.js';
import {
  createTestDiscoveryResponse,
  createTestDAppInfo,
  createTestDiscoveryInitiator,
} from './testUtils.js';
import { setupFakeTimers, cleanupFakeTimers } from './timingHelpers.js';
import { createConsoleSpy } from './consoleMocks.js';

describe('Duplicate Response Detection', () => {
  let listener: DiscoveryInitiator;
  let mockEventTarget: MockEventTarget;
  let consoleSpy: ReturnType<typeof createConsoleSpy>;

  beforeEach(() => {
    setupFakeTimers();
    mockEventTarget = new MockEventTarget();
    consoleSpy = createConsoleSpy({ methods: ['warn'], mockFn: () => vi.fn() });

    listener = createTestDiscoveryInitiator({
      requirements: {
        technologies: [
          {
            type: 'evm' as const,
            interfaces: ['eip-1193'],
          },
        ],
        features: ['account-management'],
      },
      initiatorInfo: createTestDAppInfo(),
      timeout: 5000,
      eventTarget: mockEventTarget,
    });
  });

  afterEach(() => {
    cleanupFakeTimers();
    listener.dispose();
    consoleSpy.restore();
  });

  it('should detect duplicate responses from same responder', async () => {
    // Start discovery
    const discoveryPromise = listener.startDiscovery();

    // Wait for discovery to start
    await vi.advanceTimersByTimeAsync(100);

    const sessionId = listener.getCurrentSessionId();
    expect(sessionId).toBeTruthy();
    if (!sessionId) throw new Error('Session ID should be available');

    // First response from responder
    const firstResponse = createTestDiscoveryResponse({
      sessionId: sessionId,
      rdns: 'com.example.wallet',
      responderId: 'wallet-1',
      name: 'Example Wallet',
    });

    const firstEvent = new CustomEvent('discovery:wallet:response', {
      detail: firstResponse,
    });

    mockEventTarget.dispatchEvent(firstEvent);

    // Second response from same responder (different responderId but same rdns)
    const duplicateResponse = createTestDiscoveryResponse({
      sessionId: sessionId,
      rdns: 'com.example.wallet', // Same rdns as first response
      responderId: 'wallet-2', // Different responderId
      name: 'Example Wallet Clone',
    });

    const duplicateEvent = new CustomEvent('discovery:wallet:response', {
      detail: duplicateResponse,
    });

    mockEventTarget.dispatchEvent(duplicateEvent);

    // Discovery should now throw DuplicateResponseError
    await expect(discoveryPromise).rejects.toThrow(DuplicateResponseError);

    try {
      await discoveryPromise;
    } catch (error) {
      expect(error).toBeInstanceOf(DuplicateResponseError);
      const duplicateError = error as DuplicateResponseError;

      // Verify error details
      expect(duplicateError.duplicateDetails).toEqual({
        rdns: 'com.example.wallet',
        originalResponderId: 'wallet-1',
        duplicateResponderId: 'wallet-2',
        responseCount: 2,
        sessionId: sessionId,
        detectedAt: expect.any(Number),
        originalName: 'Example Wallet',
        duplicateName: 'Example Wallet Clone',
      });

      expect(duplicateError.code).toBe(2008);
      expect(duplicateError.category).toBe('security');
      expect(duplicateError.retryable).toBe(false);
    }

    // Security violation should be logged
    expect(consoleSpy.warn).toHaveBeenCalledWith(
      '[WalletMesh] SECURITY VIOLATION: Duplicate response detected',
      expect.objectContaining({
        rdns: 'com.example.wallet',
        duplicateResponderId: 'wallet-2',
        responseCount: 2,
        sessionId: sessionId,
      }),
    );

    // Discovery should be in ERROR state
    expect(listener.getState()).toBe('ERROR');
  });

  it('should track multiple responders without false positives', async () => {
    // Start discovery
    const discoveryPromise = listener.startDiscovery();

    // Wait for discovery to start
    await vi.advanceTimersByTimeAsync(100);

    const sessionId = listener.getCurrentSessionId();
    expect(sessionId).toBeTruthy();
    if (!sessionId) throw new Error('Session ID should be available');

    // Response from first responder
    const response1 = createTestDiscoveryResponse({
      sessionId: sessionId,
      rdns: 'com.example.wallet1',
      responderId: 'wallet-1',
      name: 'Example Wallet 1',
    });

    mockEventTarget.dispatchEvent(
      new CustomEvent('discovery:wallet:response', {
        detail: response1,
      }),
    );

    // Response from second responder (different rdns)
    const response2 = createTestDiscoveryResponse({
      sessionId: sessionId,
      rdns: 'com.example.wallet2', // Different rdns
      responderId: 'wallet-2',
      name: 'Example Wallet 2',
    });

    mockEventTarget.dispatchEvent(
      new CustomEvent('discovery:wallet:response', {
        detail: response2,
      }),
    );

    // Complete discovery
    await vi.advanceTimersByTimeAsync(5000);
    const responders = await discoveryPromise;

    // Both responders should be returned
    expect(responders).toHaveLength(2);

    // No duplicate warnings should be logged
    expect(consoleSpy.warn).not.toHaveBeenCalledWith(
      '[WalletMesh] Duplicate response detected from responder',
      expect.any(Object),
    );

    // Check stats
    const stats = listener.getStats();
    expect(stats.securityStats.seenRespondersCount).toBe(2);
    expect(stats.securityStats.duplicateResponses).toHaveLength(0);
  });

  it('should handle multiple duplicates from same responder', async () => {
    // Start discovery
    const discoveryPromise = listener.startDiscovery();

    // Wait for discovery to start
    await vi.advanceTimersByTimeAsync(100);

    const sessionId = listener.getCurrentSessionId();
    expect(sessionId).toBeTruthy();
    if (!sessionId) throw new Error('Session ID should be available');

    // Send first response
    const firstResponse = createTestDiscoveryResponse({
      sessionId: sessionId,
      rdns: 'com.suspicious.wallet',
      responderId: 'wallet-1',
      name: 'Suspicious Wallet 1',
    });

    mockEventTarget.dispatchEvent(
      new CustomEvent('discovery:wallet:response', {
        detail: firstResponse,
      }),
    );

    // Send second response (duplicate - should trigger error)
    const duplicateResponse = createTestDiscoveryResponse({
      sessionId: sessionId,
      rdns: 'com.suspicious.wallet',
      responderId: 'wallet-2',
      name: 'Suspicious Wallet 2',
    });

    mockEventTarget.dispatchEvent(
      new CustomEvent('discovery:wallet:response', {
        detail: duplicateResponse,
      }),
    );

    // Discovery should error out on the duplicate
    await expect(discoveryPromise).rejects.toThrow(DuplicateResponseError);

    try {
      await discoveryPromise;
    } catch (error) {
      expect(error).toBeInstanceOf(DuplicateResponseError);
      const duplicateError = error as DuplicateResponseError;

      // Verify error details
      expect(duplicateError.duplicateDetails.rdns).toBe('com.suspicious.wallet');
      expect(duplicateError.duplicateDetails.responseCount).toBe(2);
      expect(duplicateError.duplicateDetails.originalResponderId).toBe('wallet-1');
      expect(duplicateError.duplicateDetails.duplicateResponderId).toBe('wallet-2');
    }

    // Should log security violation for the duplicate
    expect(consoleSpy.warn).toHaveBeenCalledWith(
      '[WalletMesh] SECURITY VIOLATION: Duplicate response detected',
      expect.objectContaining({
        rdns: 'com.suspicious.wallet',
        responseCount: 2,
      }),
    );

    // Discovery should be in ERROR state
    expect(listener.getState()).toBe('ERROR');
  });

  it('should clear duplicate tracking between discovery sessions', async () => {
    // First discovery session
    let discoveryPromise = listener.startDiscovery();
    await vi.advanceTimersByTimeAsync(100);

    let sessionId = listener.getCurrentSessionId();
    if (!sessionId) throw new Error('Session ID should be available');
    const response1 = createTestDiscoveryResponse({
      sessionId: sessionId,
      rdns: 'com.example.wallet',
      responderId: 'wallet-1',
    });

    mockEventTarget.dispatchEvent(
      new CustomEvent('discovery:wallet:response', {
        detail: response1,
      }),
    );

    await vi.advanceTimersByTimeAsync(5000);
    await discoveryPromise;

    // Create new listener for second discovery session (single-use pattern)
    listener = createTestDiscoveryInitiator({
      requirements: {
        technologies: [
          {
            type: 'evm' as const,
            interfaces: ['eip-1193'],
          },
        ],
        features: [],
      },
      initiatorInfo: {
        name: 'Test dApp',
        url: 'https://dapp.example.com',
        icon: 'data:image/svg+xml;base64,PHN2Zz4=',
      },
      eventTarget: mockEventTarget,
    });

    discoveryPromise = listener.startDiscovery();
    await vi.advanceTimersByTimeAsync(100);

    sessionId = listener.getCurrentSessionId();
    if (!sessionId) throw new Error('Session ID should be available');
    const response2 = createTestDiscoveryResponse({
      sessionId: sessionId,
      rdns: 'com.example.wallet', // Same rdns as first session
      responderId: 'wallet-2',
    });

    mockEventTarget.dispatchEvent(
      new CustomEvent('discovery:wallet:response', {
        detail: response2,
      }),
    );

    await vi.advanceTimersByTimeAsync(5000);
    const responders = await discoveryPromise;

    // Should not be considered a duplicate since it's a new session
    expect(responders).toHaveLength(1);
    expect(consoleSpy.warn).not.toHaveBeenCalledWith(
      '[WalletMesh] Duplicate response detected from responder',
      expect.any(Object),
    );

    // Stats should show only current session
    const stats = listener.getStats();
    expect(stats.securityStats.seenRespondersCount).toBe(1);
    expect(stats.securityStats.duplicateResponses).toHaveLength(0);
  });

  it('should not track responses from different sessions', async () => {
    // Start discovery
    const discoveryPromise = listener.startDiscovery();
    await vi.advanceTimersByTimeAsync(100);

    const sessionId = listener.getCurrentSessionId();
    if (!sessionId) throw new Error('Session ID should be available');

    // Response with correct session ID
    const validResponse = createTestDiscoveryResponse({
      sessionId: sessionId,
      rdns: 'com.example.wallet',
      responderId: 'wallet-1',
    });

    mockEventTarget.dispatchEvent(
      new CustomEvent('discovery:wallet:response', {
        detail: validResponse,
      }),
    );

    // Response with different session ID (should be ignored)
    const invalidResponse = createTestDiscoveryResponse({
      sessionId: 'different-session-id',
      rdns: 'com.example.wallet', // Same rdns
      responderId: 'wallet-2',
    });

    mockEventTarget.dispatchEvent(
      new CustomEvent('discovery:wallet:response', {
        detail: invalidResponse,
      }),
    );

    await vi.advanceTimersByTimeAsync(5000);
    const responders = await discoveryPromise;

    // Only valid response should be processed
    expect(responders).toHaveLength(1);
    expect(responders[0]?.responderId).toBe('wallet-1');

    // No duplicate should be detected since invalid response was ignored
    expect(consoleSpy.warn).not.toHaveBeenCalledWith(
      '[WalletMesh] Duplicate response detected from responder',
      expect.any(Object),
    );

    // Stats should show only one responder
    const stats = listener.getStats();
    expect(stats.securityStats.seenRespondersCount).toBe(1);
    expect(stats.securityStats.duplicateResponses).toHaveLength(0);
  });
});
