/**
 * Consolidated test helpers, assertions, and utilities.
 *
 * Combines timing utilities, state machine helpers, assertion helpers,
 * and other testing utilities into a single module.
 *
 * @module testing/helpers
 * @category Testing
 * @since 0.1.0
 */

import { vi } from 'vitest';
import type { ProtocolStateMachine } from '../core/ProtocolStateMachine.js';
import type { DiscoveryRequestEvent, DiscoveryResponseEvent } from '../types/core.js';
import type { CapabilityRequirements, ResponderInfo } from '../types/capabilities.js';

// ============================================================================
// Timing Utilities
// ============================================================================

/**
 * Advance fake timers and flush promises.
 */
export async function advanceTimersAndFlush(ms: number): Promise<void> {
  vi.advanceTimersByTime(ms);
  await flushPromises();
}

/**
 * Flush pending promises and microtasks.
 */
export async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => process.nextTick(resolve));
}

/**
 * Wait for a condition to become true with timeout.
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeoutMs = 1000,
  intervalMs = 10,
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Condition not met within ${timeoutMs}ms`);
}

/**
 * Wait for an event to be dispatched.
 */
export async function waitForEvent(target: EventTarget, eventType: string, timeoutMs = 1000): Promise<Event> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      target.removeEventListener(eventType, listener);
      reject(new Error(`Event '${eventType}' not received within ${timeoutMs}ms`));
    }, timeoutMs);

    const listener = (event: Event) => {
      clearTimeout(timeout);
      target.removeEventListener(eventType, listener);
      resolve(event);
    };

    target.addEventListener(eventType, listener);
  });
}

/**
 * Create a promise that resolves after the next tick.
 */
export function nextTick(): Promise<void> {
  return new Promise((resolve) => process.nextTick(resolve));
}

// ============================================================================
// State Machine Helpers
// ============================================================================

/**
 * Wait for state machine to reach a specific state.
 */
export async function waitForState(
  stateMachine: ProtocolStateMachine,
  targetState: string,
  timeoutMs = 1000,
): Promise<void> {
  if ((stateMachine as { isInState: (state: unknown) => boolean }).isInState(targetState)) {
    return;
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      stateMachine.off('stateChange', listener);
      reject(new Error(`State machine did not reach '${targetState}' within ${timeoutMs}ms`));
    }, timeoutMs);

    const listener = ((...args: unknown[]) => {
      const event = args[0] as { toState: string; fromState: string };
      if (event.toState === targetState) {
        clearTimeout(timeout);
        stateMachine.off('stateChange', listener);
        resolve();
      }
    }) as (...args: unknown[]) => void;

    stateMachine.on('stateChange', listener);
  });
}

/**
 * Get state transition history for testing.
 */
export function getStateHistory(stateMachine: ProtocolStateMachine): string[] {
  const history: string[] = [];

  stateMachine.on('stateChange', ((...args: unknown[]) => {
    const event = args[0] as { toState: string; fromState: string };
    history.push(`${event.fromState} -> ${event.toState}`);
  }) as (...args: unknown[]) => void);

  return history;
}

/**
 * Assert state machine is in expected state.
 */
export function assertState(
  stateMachine: ProtocolStateMachine,
  expectedState: import('../core/ProtocolStateMachine.js').ProtocolState,
): void {
  if (!(stateMachine as { isInState: (state: unknown) => boolean }).isInState(expectedState)) {
    throw new Error(
      `Expected state '${expectedState}' but was in '${(stateMachine as { state?: string }).state || 'unknown'}' `,
    );
  }
}

// ============================================================================
// Event Assertion Helpers
// ============================================================================

/**
 * Assert that an event was dispatched with expected details.
 */
export function assertEventDispatched(
  mockDispatch: { mock: { calls: Array<[Event]> } },
  eventType: string,
  expectedDetail?: Partial<Record<string, unknown>>,
): void {
  const calls = mockDispatch.mock.calls;
  const matchingCall = calls.find((call: [Event]) => {
    const event = call[0];
    return event?.type === eventType;
  });

  if (!matchingCall) {
    throw new Error(`Expected event '${eventType}' to be dispatched but it was not`);
  }

  if (expectedDetail) {
    const event = matchingCall[0] as CustomEvent;
    const actualDetail = event.detail;
    for (const [key, value] of Object.entries(expectedDetail)) {
      if (actualDetail[key] !== value) {
        throw new Error(`Expected ${key} to be ${value} but was ${actualDetail[key]}`);
      }
    }
  }
}

/**
 * Assert that no events of a specific type were dispatched.
 */
export function assertEventNotDispatched(
  mockDispatch: { mock: { calls: Array<[Event]> } },
  eventType: string,
): void {
  const calls = mockDispatch.mock.calls;
  const matchingCall = calls.find((call: [Event]) => {
    const event = call[0];
    return event?.type === eventType;
  });

  if (matchingCall) {
    throw new Error(`Expected event '${eventType}' NOT to be dispatched but it was`);
  }
}

/**
 * Get all dispatched events of a specific type.
 */
export function getDispatchedEvents(
  mockDispatch: { mock: { calls: Array<[Event]> } },
  eventType: string,
): Event[] {
  return mockDispatch.mock.calls
    .map((call: [Event]) => call[0])
    .filter((event: Event) => event?.type === eventType);
}

// ============================================================================
// Capability Testing Helpers
// ============================================================================

/**
 * Assert that capabilities match expected requirements.
 */
export function assertCapabilityMatch(
  responderInfo: ResponderInfo,
  requirements: CapabilityRequirements,
  shouldMatch = true,
): void {
  // Simple capability matching logic for testing
  const responderTechTypes = responderInfo.technologies.map((t) => t.type);
  const requiredTechTypes = requirements.technologies.map((t) => t.type);

  const hasAllTechnologies = requiredTechTypes.every((type) => responderTechTypes.includes(type));

  const responderFeatureIds = responderInfo.features.map((f) => f.id);
  const hasAllFeatures = requirements.features.every((feature) => responderFeatureIds.includes(feature));

  const actualMatch = hasAllTechnologies && hasAllFeatures;

  if (shouldMatch && !actualMatch) {
    throw new Error('Expected capabilities to match but they did not');
  }

  if (!shouldMatch && actualMatch) {
    throw new Error('Expected capabilities NOT to match but they did');
  }
}

/**
 * Create a minimal capability intersection for testing.
 */
export function createTestCapabilityIntersection(canFulfill = true, preferenceScore = 0.8) {
  return {
    technologies: [
      {
        type: 'evm' as const,
        interfaces: ['eip-1193'],
        features: ['eip-712'],
      },
    ],
    features: ['account-management', 'transaction-signing'],
    canFulfill,
    preferenceScore,
  };
}

// ============================================================================
// Test Lifecycle Helpers
// ============================================================================

/**
 * Setup common test environment with fake timers and mocks.
 */
export function setupTestEnvironment() {
  // Setup fake timers
  vi.useFakeTimers();

  // Mock crypto if not available
  if (!global.crypto) {
    global.crypto = {
      randomUUID: vi.fn(() => `test-uuid-${Math.random().toString(36).substr(2, 9)}`),
      getRandomValues: vi.fn((array: ArrayBufferView) => {
        const view = array as Uint8Array;
        for (let i = 0; i < view.length; i++) {
          view[i] = Math.floor(Math.random() * 256);
        }
        return array;
      }),
      subtle: {} as SubtleCrypto,
    } as Crypto;
  }

  return {
    cleanup: () => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    },
  };
}

/**
 * Setup a test event target with spy capabilities.
 */
export function setupTestEventTarget() {
  const mockEventTarget = new EventTarget();
  const dispatchEventSpy = vi.spyOn(mockEventTarget, 'dispatchEvent');
  const addEventListenerSpy = vi.spyOn(mockEventTarget, 'addEventListener');
  const removeEventListenerSpy = vi.spyOn(mockEventTarget, 'removeEventListener');

  return {
    eventTarget: mockEventTarget,
    spies: {
      dispatchEvent: dispatchEventSpy,
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
    },
    cleanup: () => {
      dispatchEventSpy.mockRestore();
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    },
  };
}

// ============================================================================
// Discovery Protocol Test Helpers
// ============================================================================

/**
 * Simulate a discovery request flow.
 */
export async function simulateDiscoveryRequest(
  eventTarget: EventTarget,
  request: DiscoveryRequestEvent,
  waitForResponse = true,
): Promise<DiscoveryResponseEvent | null> {
  const requestEvent = new CustomEvent('discovery:wallet:request', {
    detail: request,
  });

  if (!waitForResponse) {
    eventTarget.dispatchEvent(requestEvent);
    return null;
  }

  // Wait for response
  const responsePromise = waitForEvent(eventTarget, 'discovery:wallet:response', 1000);

  eventTarget.dispatchEvent(requestEvent);

  try {
    const responseEvent = await responsePromise;
    return (responseEvent as CustomEvent<DiscoveryResponseEvent>).detail;
  } catch {
    return null; // No response received
  }
}

/**
 * Assert discovery response has expected properties.
 */
export function assertDiscoveryResponse(
  response: DiscoveryResponseEvent,
  expectedSessionId: string,
  expectedResponderId?: string,
): void {
  if (response.sessionId !== expectedSessionId) {
    throw new Error(`Expected sessionId ${expectedSessionId} but got ${response.sessionId}`);
  }

  if (expectedResponderId && response.responderId !== expectedResponderId) {
    throw new Error(`Expected responderId ${expectedResponderId} but got ${response.responderId}`);
  }

  if (!response.rdns) {
    throw new Error('Response missing rdns');
  }

  if (!response.matched) {
    throw new Error('Response missing matched capabilities');
  }
}

/**
 * Create a test discovery session.
 */
export function createTestDiscoverySession() {
  const sessionId = `test-session-${Date.now()}`;
  const responderId = `test-responder-${Date.now()}`;

  return {
    sessionId,
    responderId,
    cleanup: () => {
      // Session cleanup logic if needed
    },
  };
}

// ============================================================================
// Error Testing Helpers
// ============================================================================

/**
 * Assert that a function throws with expected error.
 */
export function assertThrows(fn: () => unknown, expectedError?: string | RegExp | Error): Error {
  let thrownError: Error | null = null;

  try {
    fn();
  } catch (error) {
    thrownError = error as Error;
  }

  if (!thrownError) {
    throw new Error('Expected function to throw but it did not');
  }

  if (expectedError) {
    if (typeof expectedError === 'string') {
      if (!thrownError.message.includes(expectedError)) {
        throw new Error(
          `Expected error message to contain '${expectedError}' but got '${thrownError.message}'`,
        );
      }
    } else if (expectedError instanceof RegExp) {
      if (!expectedError.test(thrownError.message)) {
        throw new Error(`Expected error message to match ${expectedError} but got '${thrownError.message}'`);
      }
    } else if (expectedError instanceof Error) {
      if (thrownError.constructor !== expectedError.constructor) {
        throw new Error(
          `Expected error type ${expectedError.constructor.name} but got ${thrownError.constructor.name}`,
        );
      }
    }
  }

  return thrownError;
}

/**
 * Assert that an async function throws with expected error.
 */
export async function assertThrowsAsync(
  fn: () => Promise<unknown>,
  expectedError?: string | RegExp | Error,
): Promise<Error> {
  let thrownError: Error | null = null;

  try {
    await fn();
  } catch (error) {
    thrownError = error as Error;
  }

  if (!thrownError) {
    throw new Error('Expected async function to throw but it did not');
  }

  if (expectedError) {
    if (typeof expectedError === 'string') {
      if (!thrownError.message.includes(expectedError)) {
        throw new Error(
          `Expected error message to contain '${expectedError}' but got '${thrownError.message}'`,
        );
      }
    } else if (expectedError instanceof RegExp) {
      if (!expectedError.test(thrownError.message)) {
        throw new Error(`Expected error message to match ${expectedError} but got '${thrownError.message}'`);
      }
    } else if (expectedError instanceof Error) {
      if (thrownError.constructor !== expectedError.constructor) {
        throw new Error(
          `Expected error type ${expectedError.constructor.name} but got ${thrownError.constructor.name}`,
        );
      }
    }
  }

  return thrownError;
}
