/**
 * Enhanced event testing utilities for discovery protocol cross-origin communication.
 *
 * These utilities provide comprehensive support for testing event-driven discovery
 * protocol interactions, including CustomEvents, MessageEvents, and cross-origin
 * communication patterns. All utilities are designed to work seamlessly with the
 * MockEventTarget and other testing infrastructure.
 *
 * @example Basic event creation:
 * ```typescript
 * import { createTestEvent } from '@walletmesh/discovery/testing';
 *
 * const event = createTestEvent('discovery:request', {
 *   sessionId: 'test-session',
 *   required: { chains: ['eip155:1'], features: [], interfaces: [] }
 * });
 *
 * eventTarget.dispatchEvent(event);
 * ```
 *
 * @example Cross-origin message simulation:
 * ```typescript
 * import { simulateMessageEvent } from '@walletmesh/discovery/testing';
 *
 * const messageEvent = simulateMessageEvent(
 *   { type: 'wallet:announce', data: walletInfo },
 *   'https://wallet-provider.com'
 * );
 * ```
 *
 * @module eventHelpers
 * @category Testing
 * @since 1.0.0
 */

import type { DiscoveryRequestEvent, DiscoveryResponseEvent, DiscoveryMessage } from '../core/types.js';
import { DISCOVERY_EVENTS } from '../core/constants.js';
import { vi, expect } from 'vitest';

/**
 * Configuration options for event creation.
 */
export interface EventConfig {
  /** Whether the event should bubble */
  bubbles?: boolean;
  /** Whether the event can be cancelled */
  cancelable?: boolean;
  /** Whether the event is composed (crosses shadow DOM boundaries) */
  composed?: boolean;
  /** Additional custom properties to add to the event */
  customProperties?: Record<string, unknown>;
}

/**
 * Configuration for cross-origin message simulation.
 */
export interface MessageEventConfig {
  /** The origin of the message sender */
  origin: string;
  /** The last event ID (for server-sent events) */
  lastEventId?: string;
  /** The source window (can be null for testing) */
  source?: MessageEventSource | null;
  /** Array of MessagePort objects */
  ports?: MessagePort[];
}

/**
 * Event chain step configuration for sequential event testing.
 */
export interface EventChainStep {
  /** Type of event to dispatch */
  eventType: string;
  /** Event detail/data */
  detail: unknown;
  /** Delay before dispatching this event (in milliseconds) */
  delay?: number;
  /** Optional validation function to run after dispatching */
  validation?: (event: Event) => void | Promise<void>;
  /** Whether to wait for this event to be processed before continuing */
  waitForProcessing?: boolean;
}

/**
 * Create a standardized test event with discovery protocol structure.
 *
 * This function creates CustomEvent objects with the correct structure for
 * discovery protocol testing. It ensures consistent event format and provides
 * sensible defaults for testing scenarios.
 *
 * @param type - The event type (should match discovery protocol events)
 * @param detail - The event detail object (the actual message payload)
 * @param options - Additional event configuration options
 * @returns A properly formatted CustomEvent for discovery protocol testing
 * @example
 * ```typescript
 * // Create a discovery request event
 * const requestEvent = createTestEvent('discovery:request', {
 *   type: 'discovery:wallet:request',
 *   sessionId: 'test-session-123',
 *   required: {
 *     chains: ['eip155:1'],
 *     features: ['account-management'],
 *     interfaces: ['eip-1193']
 *   },
 *   initiatorInfo: createTestDAppInfo()
 * });
 *
 * // Create a discovery response event
 * const responseEvent = createTestEvent('responder:announce', {
 *   type: 'discovery:wallet:announce',
 *   sessionId: 'test-session-123',
 *   responderId: 'wallet-123',
 *   name: 'Test Wallet',
 *   matched: { required: { chains: ['eip155:1'], features: [], interfaces: [] } }
 * });
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function createTestEvent(type: string, detail: unknown, options: EventConfig = {}): CustomEvent {
  const event = new CustomEvent(type, {
    detail,
    bubbles: options.bubbles ?? false,
    cancelable: options.cancelable ?? false,
    composed: options.composed ?? false,
  });

  // Add custom properties directly to the event object
  if (options.customProperties) {
    Object.assign(event, options.customProperties);
  }

  return event;
}

/**
 * Create a discovery protocol discovery request event.
 *
 * This specialized function creates a properly formatted discovery request event
 * with all required discovery protocol fields. It's a convenience wrapper around
 * createTestEvent for the most common discovery protocol event type.
 *
 * @param request - The discovery request object
 * @param options - Additional event configuration options
 * @returns CustomEvent formatted for discovery request
 * @example
 * ```typescript
 * const request = createTestDiscoveryRequest({
 *   required: { chains: ['eip155:1'], features: ['account-management'], interfaces: ['eip-1193'] }
 * });
 *
 * const event = createDiscoveryRequestEvent(request);
 * mockEventTarget.dispatchEvent(event);
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function createDiscoveryRequestEvent(
  request: DiscoveryRequestEvent,
  options: EventConfig = {},
): CustomEvent<DiscoveryRequestEvent> {
  return createTestEvent(DISCOVERY_EVENTS.REQUEST, request, options);
}

/**
 * Create a discovery protocol discovery response event.
 *
 * This specialized function creates a properly formatted discovery response event
 * with all required discovery protocol fields. It's a convenience wrapper for
 * wallet announcement events.
 *
 * @param response - The discovery response object
 * @param options - Additional event configuration options
 * @returns CustomEvent formatted for discovery response
 * @example
 * ```typescript
 * const response = createTestDiscoveryResponse({
 *   sessionId: 'test-session',
 *   name: 'Test Wallet',
 *   matched: { required: { chains: ['eip155:1'], features: [], interfaces: [] } }
 * });
 *
 * const event = createDiscoveryResponseEvent(response);
 * mockEventTarget.dispatchEvent(event);
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function createDiscoveryResponseEvent(
  response: DiscoveryResponseEvent,
  options: EventConfig = {},
): CustomEvent<DiscoveryResponseEvent> {
  return createTestEvent(DISCOVERY_EVENTS.RESPONSE, response, options);
}

/**
 * Simulate a cross-origin MessageEvent for testing.
 *
 * This function creates MessageEvent objects that simulate cross-origin
 * communication, which is essential for testing discovery protocol security
 * and origin validation features.
 *
 * @param data - The message data (typically a discovery protocol message)
 * @param config - Configuration for the message event including origin
 * @returns MessageEvent configured for cross-origin testing
 * @example
 * ```typescript
 * // Simulate a message from a wallet extension
 * const messageEvent = simulateMessageEvent(
 *   {
 *     type: 'wallet:ready',
 *     walletInfo: createTestResponderInfo.ethereum()
 *   },
 *   { origin: 'chrome-extension://wallet-extension-id' }
 * );
 *
 * // Simulate a message from a dApp
 * const dappMessage = simulateMessageEvent(
 *   { type: 'discovery:request', request: capabilityRequest },
 *   { origin: 'https://my-dapp.com' }
 * );
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function simulateMessageEvent(data: unknown, config: MessageEventConfig): MessageEvent {
  return new MessageEvent('message', {
    data,
    origin: config.origin,
    lastEventId: config.lastEventId || '',
    source: config.source || null,
    ports: config.ports || [],
  });
}

/**
 * Create and dispatch a sequence of events to test complex interactions.
 *
 * This utility function helps test complex discovery protocol flows that involve
 * multiple events in sequence. It handles timing, validation, and proper event
 * ordering automatically.
 *
 * @param eventTarget - The EventTarget to dispatch events on
 * @param steps - Array of event chain steps to execute
 * @param options - Configuration options for the event chain
 * @returns Promise that resolves when all events in the chain have been dispatched
 * @example
 * ```typescript
 * await createDiscoveryEventChain(mockEventTarget, [
 *   {
 *     eventType: 'discovery:request',
 *     detail: capabilityRequest,
 *     validation: () => expect(announcer.isListening()).toBe(true)
 *   },
 *   {
 *     eventType: 'responder:announce',
 *     detail: capabilityResponse,
 *     delay: 100,
 *     validation: (event) => expect(event.detail.name).toBe('Test Wallet')
 *   },
 *   {
 *     eventType: 'discovery:complete',
 *     detail: { sessionId: 'test-session' },
 *     delay: 50
 *   }
 * ]);
 * ```
 * @category Testing
 * @since 1.0.0
 */
export async function createDiscoveryEventChain(
  eventTarget: EventTarget,
  steps: EventChainStep[],
  options: {
    /** Whether to use fake timers for delays */
    useFakeTimers?: boolean;
    /** Default delay between events if not specified per step */
    defaultDelay?: number;
  } = {},
): Promise<Event[]> {
  const dispatchedEvents: Event[] = [];
  const { useFakeTimers = true, defaultDelay = 0 } = options;

  for (const step of steps) {
    // Apply delay if specified
    const delay = step.delay ?? defaultDelay;
    if (delay > 0) {
      if (useFakeTimers && typeof vi !== 'undefined') {
        const { advanceTimeAndWait } = await import('./timingHelpers.js');
        await advanceTimeAndWait(delay);
      } else {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // Create and dispatch the event
    const event = createTestEvent(step.eventType, step.detail);
    eventTarget.dispatchEvent(event);
    dispatchedEvents.push(event);

    // Run validation if provided
    if (step.validation) {
      await step.validation(event);
    }

    // Wait for processing if requested
    if (step.waitForProcessing) {
      await new Promise((resolve) => process.nextTick(resolve));
    }
  }

  return dispatchedEvents;
}

/**
 * Capture and analyze events dispatched during a test operation.
 *
 * This utility function captures all events of specified types that are dispatched
 * during the execution of a test operation, providing detailed analysis of the
 * event flow for validation.
 *
 * @param eventTarget - The EventTarget to monitor for events
 * @param eventTypes - Array of event types to capture
 * @param operation - The test operation to execute while capturing events
 * @returns Promise that resolves with captured events and analysis
 * @example
 * ```typescript
 * const analysis = await captureEventFlow(
 *   mockEventTarget,
 *   ['discovery:request', 'responder:announce', 'discovery:complete'],
 *   async () => {
 *     await listener.startDiscovery();
 *     announcer.simulateDiscoveryRequest(request);
 *   }
 * );
 *
 * expect(analysis.capturedEvents).toHaveLength(3);
 * expect(analysis.eventOrder).toEqual(['discovery:request', 'responder:announce', 'discovery:complete']);
 * ```
 * @category Testing
 * @since 1.0.0
 */
export async function captureEventFlow<T>(
  eventTarget: EventTarget,
  eventTypes: string[],
  operation: () => Promise<T> | T,
): Promise<{
  result: T;
  capturedEvents: Array<{ type: string; event: Event; timestamp: number }>;
  eventOrder: string[];
  timing: { start: number; end: number; duration: number };
}> {
  const capturedEvents: Array<{ type: string; event: Event; timestamp: number }> = [];
  const listeners = new Map<string, (event: Event) => void>();

  // Set up event listeners
  for (const eventType of eventTypes) {
    const listener = (event: Event) => {
      capturedEvents.push({
        type: eventType,
        event,
        timestamp: Date.now(),
      });
    };

    listeners.set(eventType, listener);
    eventTarget.addEventListener(eventType, listener);
  }

  const startTime = Date.now();

  try {
    const result = await operation();
    const endTime = Date.now();

    return {
      result,
      capturedEvents,
      eventOrder: capturedEvents.map((e) => e.type),
      timing: {
        start: startTime,
        end: endTime,
        duration: endTime - startTime,
      },
    };
  } finally {
    // Clean up event listeners
    for (const [eventType, listener] of listeners) {
      eventTarget.removeEventListener(eventType, listener);
    }
  }
}

/**
 * Create a mock event listener that tracks calls and provides testing utilities.
 *
 * This utility creates a mock event listener function that tracks how many times
 * it was called, what events it received, and provides utilities for testing
 * event handling behavior.
 *
 * @param config - Configuration for the mock listener behavior
 * @returns Mock event listener with testing utilities
 * @example
 * ```typescript
 * const mockListener = createMockEventListener({
 *   shouldThrow: false,
 *   customHandler: (event) => console.log('Received:', event.type)
 * });
 *
 * eventTarget.addEventListener('test:event', mockListener.listener);
 * eventTarget.dispatchEvent(createTestEvent('test:event', { data: 'test' }));
 *
 * expect(mockListener.callCount).toBe(1);
 * expect(mockListener.receivedEvents).toHaveLength(1);
 * expect(mockListener.wasCalledWith('test:event')).toBe(true);
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function createMockEventListener(
  config: {
    /** Whether the listener should throw an error when called */
    shouldThrow?: boolean;
    /** Custom error to throw if shouldThrow is true */
    throwError?: Error;
    /** Custom handler function to call for each event */
    customHandler?: (event: Event) => void | Promise<void>;
    /** Whether to automatically prevent default on events */
    preventDefault?: boolean;
    /** Whether to automatically stop propagation on events */
    stopPropagation?: boolean;
  } = {},
) {
  const receivedEvents: Event[] = [];
  let callCount = 0;

  const listener = async (event: Event) => {
    callCount++;
    receivedEvents.push(event);

    // Apply event modifications if requested
    if (config.preventDefault) {
      event.preventDefault();
    }

    if (config.stopPropagation) {
      event.stopPropagation();
    }

    // Run custom handler if provided
    if (config.customHandler) {
      await config.customHandler(event);
    }

    // Throw error if configured to do so
    if (config.shouldThrow) {
      throw config.throwError || new Error('Mock listener error');
    }
  };

  return {
    listener,

    // Testing utilities
    get callCount() {
      return callCount;
    },
    get receivedEvents() {
      return [...receivedEvents];
    },

    wasCalledWith(eventType: string): boolean {
      return receivedEvents.some((event) => event.type === eventType);
    },

    getEventsOfType(eventType: string): Event[] {
      return receivedEvents.filter((event) => event.type === eventType);
    },

    getLastEvent(): Event | undefined {
      return receivedEvents[receivedEvents.length - 1];
    },

    reset(): void {
      callCount = 0;
      receivedEvents.length = 0;
    },

    // Assertion helpers
    expectCallCount(expected: number): void {
      expect(callCount).toBe(expected);
    },

    expectEventCount(eventType: string, expected: number): void {
      const events = this.getEventsOfType(eventType);
      expect(events).toHaveLength(expected);
    },

    expectLastEventType(eventType: string): void {
      const lastEvent = this.getLastEvent();
      expect(lastEvent?.type).toBe(eventType);
    },
  };
}

/**
 * Test event propagation and bubbling behavior.
 *
 * This utility helps test how events propagate through the event system,
 * including bubbling, capturing, and stopping propagation scenarios.
 *
 * @param parentTarget - Parent EventTarget for bubbling tests
 * @param childTarget - Child EventTarget that will dispatch the event
 * @param eventType - Type of event to test
 * @param detail - Event detail data
 * @returns Promise with propagation test results
 * @example
 * ```typescript
 * const parent = new MockEventTarget();
 * const child = new MockEventTarget();
 *
 * const results = await testEventPropagation(
 *   parent,
 *   child,
 *   'test:event',
 *   { data: 'test' }
 * );
 *
 * expect(results.bubbled).toBe(true);
 * expect(results.capturedOnParent).toBe(true);
 * ```
 * @category Testing
 * @since 1.0.0
 */
export async function testEventPropagation(
  parentTarget: EventTarget,
  childTarget: EventTarget,
  eventType: string,
  detail: unknown,
): Promise<{
  bubbled: boolean;
  capturedOnParent: boolean;
  capturedOnChild: boolean;
  propagationStopped: boolean;
}> {
  let parentCaptured = false;
  let parentBubbled = false;
  let childCaptured = false;
  let propagationStopped = false;

  // Set up capture phase listener on parent
  const parentCaptureListener = () => {
    parentCaptured = true;
  };
  parentTarget.addEventListener(eventType, parentCaptureListener, { capture: true });

  // Set up bubble phase listener on parent
  const parentBubbleListener = () => {
    parentBubbled = true;
  };
  parentTarget.addEventListener(eventType, parentBubbleListener, { capture: false });

  // Set up listener on child
  const childListener = (event: Event) => {
    childCaptured = true;
    // Test stopping propagation
    if (detail && typeof detail === 'object' && 'stopPropagation' in detail) {
      event.stopPropagation();
      propagationStopped = true;
    }
  };
  childTarget.addEventListener(eventType, childListener);

  // Create and dispatch event
  const event = createTestEvent(eventType, detail, { bubbles: true });
  childTarget.dispatchEvent(event);

  // Clean up listeners
  parentTarget.removeEventListener(eventType, parentCaptureListener, { capture: true });
  parentTarget.removeEventListener(eventType, parentBubbleListener, { capture: false });
  childTarget.removeEventListener(eventType, childListener);

  return {
    bubbled: parentBubbled,
    capturedOnParent: parentCaptured,
    capturedOnChild: childCaptured,
    propagationStopped,
  };
}

/**
 * Create a batch of test events for bulk testing scenarios.
 *
 * This utility creates multiple events at once with different configurations,
 * useful for testing scenarios that involve processing multiple events in
 * sequence or testing event handling under load.
 *
 * @param eventConfigs - Array of event configurations to create
 * @returns Array of created CustomEvent objects
 * @example
 * ```typescript
 * const events = createEventBatch([
 *   { type: 'discovery:request', detail: request1 },
 *   { type: 'discovery:request', detail: request2 },
 *   { type: 'responder:announce', detail: response1 },
 *   { type: 'responder:announce', detail: response2 },
 * ]);
 *
 * // Dispatch all events rapidly
 * events.forEach(event => eventTarget.dispatchEvent(event));
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function createEventBatch(
  eventConfigs: Array<{
    type: string;
    detail: unknown;
    options?: EventConfig;
  }>,
): CustomEvent[] {
  return eventConfigs.map((config) => createTestEvent(config.type, config.detail, config.options));
}

/**
 * Validate that an event conforms to discovery protocol message structure.
 *
 * This utility function validates that a CustomEvent contains a properly
 * formatted discovery protocol message in its detail property.
 *
 * @param event - The event to validate
 * @param expectedType - Expected discovery message type
 * @returns Validation result with details about any issues found
 * @example
 * ```typescript
 * const event = createDiscoveryRequestEvent(request);
 * const validation = validateDiscoveryEvent(event, 'discovery:wallet:request');
 *
 * expect(validation.valid).toBe(true);
 * expect(validation.messageType).toBe('discovery:wallet:request');
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function validateDiscoveryEvent(
  event: Event,
  expectedType?: string,
): {
  valid: boolean;
  messageType?: string;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if it's a CustomEvent
  if (!(event instanceof CustomEvent)) {
    errors.push('Event is not a CustomEvent');
    return { valid: false, errors, warnings };
  }

  // Check if detail exists
  if (!event.detail) {
    errors.push('Event detail is missing');
    return { valid: false, errors, warnings };
  }

  const detail = event.detail as DiscoveryMessage;

  // Check for required message fields
  if (!detail.type || typeof detail.type !== 'string') {
    errors.push('Message type is missing or invalid');
  } else if (expectedType && detail.type !== expectedType) {
    errors.push(`Expected message type '${expectedType}', got '${detail.type}'`);
  }

  if (!detail.version || typeof detail.version !== 'string') {
    errors.push('Message version is missing or invalid');
  }

  if (!detail.sessionId || typeof detail.sessionId !== 'string') {
    errors.push('Message sessionId is missing or invalid');
  }

  // Type-specific validation
  if (detail.type === 'discovery:wallet:request') {
    const request = detail as DiscoveryRequestEvent;

    if (!request.origin || typeof request.origin !== 'string') {
      errors.push('Capability request origin is missing or invalid');
    }

    if (!request.required || typeof request.required !== 'object') {
      errors.push('Capability request required field is missing or invalid');
    }

    if (!request.initiatorInfo || typeof request.initiatorInfo !== 'object') {
      errors.push('Capability request initiatorInfo is missing or invalid');
    }
  } else if (detail.type === 'discovery:wallet:response') {
    const response = detail as DiscoveryResponseEvent;

    if (!response.responderId || typeof response.responderId !== 'string') {
      errors.push('Capability response responderId is missing or invalid');
    }

    if (!response.name || typeof response.name !== 'string') {
      errors.push('Capability response name is missing or invalid');
    }

    if (!response.matched || typeof response.matched !== 'object') {
      errors.push('Capability response matched field is missing or invalid');
    }
  }

  return {
    valid: errors.length === 0,
    messageType: detail.type,
    errors,
    warnings,
  };
}
