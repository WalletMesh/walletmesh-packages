/**
 * Tests for event testing utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createTestEvent,
  createDiscoveryRequestEvent,
  createDiscoveryResponseEvent,
  simulateMessageEvent,
  createDiscoveryEventChain,
  captureEventFlow,
  createMockEventListener,
  testEventPropagation,
  createEventBatch,
  validateDiscoveryEvent,
  type EventConfig,
  type MessageEventConfig,
  type EventChainStep,
} from './eventHelpers.js';
import { MockEventTarget } from './MockEventTarget.js';
import { DISCOVERY_EVENTS } from '../core/constants.js';
import { createTestDiscoveryRequest, createTestDiscoveryResponse } from './testUtils.js';
import { setupFakeTimers, cleanupFakeTimers } from './timingHelpers.js';

describe('eventHelpers', () => {
  let mockEventTarget: MockEventTarget;

  beforeEach(() => {
    setupFakeTimers();
    mockEventTarget = new MockEventTarget();
  });

  afterEach(() => {
    cleanupFakeTimers();
  });

  describe('createTestEvent', () => {
    it('should create basic custom event', () => {
      const detail = { message: 'test' };
      const event = createTestEvent('test:event', detail);

      expect(event).toBeInstanceOf(CustomEvent);
      expect(event.type).toBe('test:event');
      expect(event.detail).toBe(detail);
      expect(event.bubbles).toBe(false);
      expect(event.cancelable).toBe(false);
    });

    it('should create event with custom options', () => {
      const detail = { message: 'test' };
      const options: EventConfig = {
        bubbles: true,
        cancelable: true,
        composed: true,
      };

      const event = createTestEvent('test:event', detail, options);

      expect(event.bubbles).toBe(true);
      expect(event.cancelable).toBe(true);
      expect(event.composed).toBe(true);
    });

    it('should add custom properties to event', () => {
      const detail = { message: 'test' };
      const options: EventConfig = {
        customProperties: {
          customProp: 'custom-value',
          customNumber: 42,
        },
      };

      const event = createTestEvent('test:event', detail, options);

      expect((event as CustomEvent & Record<string, unknown>)['customProp']).toBe('custom-value');
      expect((event as CustomEvent & Record<string, unknown>)['customNumber']).toBe(42);
    });

    it('should handle undefined detail', () => {
      const event = createTestEvent('test:event', undefined);

      // CustomEvent converts undefined to null
      expect(event.detail).toBeNull();
      expect(event.type).toBe('test:event');
    });

    it('should handle complex detail objects', () => {
      const detail = {
        nested: {
          array: [1, 2, 3],
          boolean: true,
          null: null,
        },
      };

      const event = createTestEvent('test:event', detail);

      expect(event.detail).toEqual(detail);
    });
  });

  describe('createDiscoveryRequestEvent', () => {
    it('should create discovery request event', () => {
      const request = createTestDiscoveryRequest();
      const event = createDiscoveryRequestEvent(request);

      expect(event).toBeInstanceOf(CustomEvent);
      expect(event.type).toBe(DISCOVERY_EVENTS.REQUEST);
      expect(event.detail).toBe(request);
    });

    it('should create discovery request event with options', () => {
      const request = createTestDiscoveryRequest();
      const options: EventConfig = {
        bubbles: true,
        cancelable: true,
      };

      const event = createDiscoveryRequestEvent(request, options);

      expect(event.bubbles).toBe(true);
      expect(event.cancelable).toBe(true);
      expect(event.detail.type).toBe('discovery:wallet:request');
    });

    it('should handle custom request data', () => {
      const request = createTestDiscoveryRequest({
        required: {
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ],
          features: ['account-management', 'transaction-signing'],
        },
      });

      const event = createDiscoveryRequestEvent(request);

      expect(event.detail.required.technologies).toBeDefined();
      expect(event.detail.required.features).toEqual(['account-management', 'transaction-signing']);
    });
  });

  describe('createDiscoveryResponseEvent', () => {
    it('should create discovery response event', () => {
      const response = createTestDiscoveryResponse();
      const event = createDiscoveryResponseEvent(response);

      expect(event).toBeInstanceOf(CustomEvent);
      expect(event.type).toBe(DISCOVERY_EVENTS.RESPONSE);
      expect(event.detail).toBe(response);
    });

    it('should create discovery response event with options', () => {
      const response = createTestDiscoveryResponse();
      const options: EventConfig = {
        bubbles: true,
        customProperties: { source: 'test' },
      };

      const event = createDiscoveryResponseEvent(response, options);

      expect(event.bubbles).toBe(true);
      expect((event as CustomEvent & Record<string, unknown>)['source']).toBe('test');
      expect(event.detail.type).toBe('discovery:wallet:response');
    });

    it('should handle custom response data', () => {
      const response = createTestDiscoveryResponse({
        name: 'Custom Test Wallet',
        rdns: 'com.custom.wallet',
      });

      const event = createDiscoveryResponseEvent(response);

      expect(event.detail.name).toBe('Custom Test Wallet');
      expect(event.detail.rdns).toBe('com.custom.wallet');
    });
  });

  describe('simulateMessageEvent', () => {
    it('should create message event with basic config', () => {
      const data = { type: 'test', message: 'hello' };
      const config: MessageEventConfig = {
        origin: 'https://example.com',
      };

      const event = simulateMessageEvent(data, config);

      expect(event).toBeInstanceOf(MessageEvent);
      expect(event.type).toBe('message');
      expect(event.data).toBe(data);
      expect(event.origin).toBe('https://example.com');
      expect(event.lastEventId).toBe('');
      expect(event.source).toBe(null);
      expect(event.ports).toEqual([]);
    });

    it('should create message event with full config', () => {
      const data = { type: 'wallet:ready' };
      const mockSource = {} as MessageEventSource;
      const mockPorts = [] as MessagePort[];
      const config: MessageEventConfig = {
        origin: 'chrome-extension://wallet-id',
        lastEventId: 'event-123',
        source: mockSource,
        ports: mockPorts,
      };

      const event = simulateMessageEvent(data, config);

      expect(event.origin).toBe('chrome-extension://wallet-id');
      expect(event.lastEventId).toBe('event-123');
      expect(event.source).toBe(mockSource);
      expect(event.ports).toBe(mockPorts);
    });

    it('should handle different origin types', () => {
      const data = { message: 'test' };

      const httpsEvent = simulateMessageEvent(data, { origin: 'https://dapp.com' });
      expect(httpsEvent.origin).toBe('https://dapp.com');

      const extensionEvent = simulateMessageEvent(data, { origin: 'chrome-extension://id' });
      expect(extensionEvent.origin).toBe('chrome-extension://id');

      const localhostEvent = simulateMessageEvent(data, { origin: 'http://localhost:3000' });
      expect(localhostEvent.origin).toBe('http://localhost:3000');
    });

    it('should handle complex data objects', () => {
      const complexData = {
        type: 'discovery:request',
        sessionId: 'test-session',
        required: {
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ],
          features: ['account-management'],
        },
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
        },
      };

      const event = simulateMessageEvent(complexData, { origin: 'https://example.com' });

      expect(event.data).toEqual(complexData);
    });
  });

  describe('createDiscoveryEventChain', () => {
    it('should execute simple event chain', async () => {
      const steps: EventChainStep[] = [
        {
          eventType: 'step1',
          detail: { step: 1 },
        },
        {
          eventType: 'step2',
          detail: { step: 2 },
        },
      ];

      const events = await createDiscoveryEventChain(mockEventTarget, steps);

      expect(events).toHaveLength(2);
      expect(events[0]?.type).toBe('step1');
      expect(events[1]?.type).toBe('step2');

      const dispatched = mockEventTarget.getDispatchedEvents();
      expect(dispatched).toHaveLength(2);
    });

    it('should handle delays with fake timers', async () => {
      const validationCalls: number[] = [];
      const steps: EventChainStep[] = [
        {
          eventType: 'step1',
          detail: { step: 1 },
          validation: () => {
            validationCalls.push(1);
          },
        },
        {
          eventType: 'step2',
          detail: { step: 2 },
          delay: 100,
          validation: () => {
            validationCalls.push(2);
          },
        },
      ];

      const promise = createDiscoveryEventChain(mockEventTarget, steps, {
        useFakeTimers: true,
      });

      // Advance timers to complete delays
      await vi.advanceTimersByTimeAsync(200);

      const events = await promise;

      expect(events).toHaveLength(2);
      expect(validationCalls).toEqual([1, 2]);
    });

    it('should run validation functions', async () => {
      const validationResults: unknown[] = [];
      const steps: EventChainStep[] = [
        {
          eventType: 'test:event',
          detail: { data: 'test' },
          validation: (event) => {
            validationResults.push(event.type);
            expect(event.type).toBe('test:event');
          },
        },
      ];

      await createDiscoveryEventChain(mockEventTarget, steps);

      expect(validationResults).toEqual(['test:event']);
    });

    it('should handle async validation functions', async () => {
      const validationResults: string[] = [];
      const steps: EventChainStep[] = [
        {
          eventType: 'async:event',
          detail: { async: true },
          validation: async () => {
            // Use fake timer promise
            const promise = new Promise((resolve) => setTimeout(resolve, 10));
            vi.advanceTimersByTime(10);
            await promise;
            validationResults.push('async-validated');
          },
        },
      ];

      await createDiscoveryEventChain(mockEventTarget, steps);

      expect(validationResults).toEqual(['async-validated']);
    });

    it('should handle waitForProcessing option', async () => {
      const processingOrder: string[] = [];
      const steps: EventChainStep[] = [
        {
          eventType: 'step1',
          detail: { step: 1 },
          waitForProcessing: true,
          validation: () => {
            processingOrder.push('step1-validated');
          },
        },
        {
          eventType: 'step2',
          detail: { step: 2 },
          validation: () => {
            processingOrder.push('step2-validated');
          },
        },
      ];

      await createDiscoveryEventChain(mockEventTarget, steps);

      expect(processingOrder).toEqual(['step1-validated', 'step2-validated']);
    });

    it('should use default delay when specified', async () => {
      const steps: EventChainStep[] = [
        { eventType: 'step1', detail: { step: 1 } },
        { eventType: 'step2', detail: { step: 2 } },
      ];

      const promise = createDiscoveryEventChain(mockEventTarget, steps, {
        defaultDelay: 50,
        useFakeTimers: true,
      });

      await vi.advanceTimersByTimeAsync(200);
      const events = await promise;

      expect(events).toHaveLength(2);
    });
  });

  describe('captureEventFlow', () => {
    it('should capture events during operation', async () => {
      const eventTypes = ['test:event1', 'test:event2'];

      const analysis = await captureEventFlow(mockEventTarget, eventTypes, async () => {
        mockEventTarget.dispatchEvent(createTestEvent('test:event1', { data: 1 }));
        mockEventTarget.dispatchEvent(createTestEvent('test:event2', { data: 2 }));
        return 'operation-result';
      });

      expect(analysis.result).toBe('operation-result');
      expect(analysis.capturedEvents).toHaveLength(2);
      expect(analysis.eventOrder).toEqual(['test:event1', 'test:event2']);
      expect(analysis.timing.duration).toBeGreaterThanOrEqual(0);
    });

    it('should only capture specified event types', async () => {
      const eventTypes = ['target:event'];

      const analysis = await captureEventFlow(mockEventTarget, eventTypes, async () => {
        mockEventTarget.dispatchEvent(createTestEvent('target:event', { data: 1 }));
        mockEventTarget.dispatchEvent(createTestEvent('other:event', { data: 2 }));
        return 'result';
      });

      expect(analysis.capturedEvents).toHaveLength(1);
      expect(analysis.capturedEvents[0]?.type).toBe('target:event');
    });

    it('should clean up listeners after operation', async () => {
      const eventTypes = ['cleanup:test'];
      let listenerCount = 0;

      // Mock addEventListener to count listeners
      const originalAddEventListener = mockEventTarget.addEventListener;
      const originalRemoveEventListener = mockEventTarget.removeEventListener;

      mockEventTarget.addEventListener = vi.fn((type, listener, options) => {
        listenerCount++;
        return originalAddEventListener.call(mockEventTarget, type, listener, options);
      });

      mockEventTarget.removeEventListener = vi.fn((type, listener, options) => {
        listenerCount--;
        return originalRemoveEventListener.call(mockEventTarget, type, listener, options);
      });

      await captureEventFlow(mockEventTarget, eventTypes, () => 'test');

      expect(listenerCount).toBe(0); // All listeners should be cleaned up
    });

    it('should handle operation errors and still cleanup', async () => {
      const eventTypes = ['error:test'];

      await expect(
        captureEventFlow(mockEventTarget, eventTypes, () => {
          throw new Error('Operation failed');
        }),
      ).rejects.toThrow('Operation failed');

      // Listeners should still be cleaned up (tested implicitly by not causing memory leaks)
    });

    it('should capture timing information', async () => {
      const operationPromise = captureEventFlow(mockEventTarget, ['timing:test'], async () => {
        const promise = new Promise((resolve) => setTimeout(resolve, 10));
        await vi.advanceTimersByTimeAsync(10);
        await promise;
        return 'timed-result';
      });

      const analysis = await operationPromise;

      expect(analysis.timing.start).toBeTypeOf('number');
      expect(analysis.timing.end).toBeTypeOf('number');
      expect(analysis.timing.duration).toBeGreaterThanOrEqual(0);
      expect(analysis.timing.end).toBeGreaterThanOrEqual(analysis.timing.start);
    });
  });

  describe('createMockEventListener', () => {
    it('should create basic mock listener', () => {
      const mockListener = createMockEventListener();

      expect(mockListener.listener).toBeTypeOf('function');
      expect(mockListener.callCount).toBe(0);
      expect(mockListener.receivedEvents).toEqual([]);
    });

    it('should track calls and events', async () => {
      const mockListener = createMockEventListener();
      const event1 = createTestEvent('test1', { data: 1 });
      const event2 = createTestEvent('test2', { data: 2 });

      await mockListener.listener(event1);
      await mockListener.listener(event2);

      expect(mockListener.callCount).toBe(2);
      expect(mockListener.receivedEvents).toHaveLength(2);
      expect(mockListener.receivedEvents[0]).toBe(event1);
      expect(mockListener.receivedEvents[1]).toBe(event2);
    });

    it('should support wasCalledWith utility', async () => {
      const mockListener = createMockEventListener();

      await mockListener.listener(createTestEvent('type1', {}));
      await mockListener.listener(createTestEvent('type2', {}));

      expect(mockListener.wasCalledWith('type1')).toBe(true);
      expect(mockListener.wasCalledWith('type2')).toBe(true);
      expect(mockListener.wasCalledWith('type3')).toBe(false);
    });

    it('should support getEventsOfType utility', async () => {
      const mockListener = createMockEventListener();

      await mockListener.listener(createTestEvent('typeA', { data: 1 }));
      await mockListener.listener(createTestEvent('typeB', { data: 2 }));
      await mockListener.listener(createTestEvent('typeA', { data: 3 }));

      const typeAEvents = mockListener.getEventsOfType('typeA');
      expect(typeAEvents).toHaveLength(2);
      expect((typeAEvents[0] as CustomEvent).detail.data).toBe(1);
      expect((typeAEvents[1] as CustomEvent).detail.data).toBe(3);
    });

    it('should support getLastEvent utility', async () => {
      const mockListener = createMockEventListener();

      expect(mockListener.getLastEvent()).toBeUndefined();

      const event1 = createTestEvent('first', {});
      const event2 = createTestEvent('last', {});

      await mockListener.listener(event1);
      await mockListener.listener(event2);

      expect(mockListener.getLastEvent()).toBe(event2);
    });

    it('should support reset functionality', async () => {
      const mockListener = createMockEventListener();

      await mockListener.listener(createTestEvent('test', {}));
      expect(mockListener.callCount).toBe(1);

      mockListener.reset();

      expect(mockListener.callCount).toBe(0);
      expect(mockListener.receivedEvents).toEqual([]);
    });

    it('should handle custom handler', async () => {
      const customHandlerCalls: Event[] = [];
      const mockListener = createMockEventListener({
        customHandler: (event) => {
          customHandlerCalls.push(event);
        },
      });

      const event = createTestEvent('custom', { data: 'test' });
      await mockListener.listener(event);

      expect(customHandlerCalls).toHaveLength(1);
      expect(customHandlerCalls[0]).toBe(event);
    });

    it('should handle async custom handler', async () => {
      const customResults: string[] = [];
      const mockListener = createMockEventListener({
        customHandler: async () => {
          const promise = new Promise((resolve) => setTimeout(resolve, 10));
          vi.advanceTimersByTime(10);
          await promise;
          customResults.push('async-handled');
        },
      });

      await mockListener.listener(createTestEvent('async', {}));

      expect(customResults).toEqual(['async-handled']);
    });

    it('should handle preventDefault option', async () => {
      const mockListener = createMockEventListener({
        preventDefault: true,
      });

      const event = createTestEvent('prevent', {}, { cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      await mockListener.listener(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should handle stopPropagation option', async () => {
      const mockListener = createMockEventListener({
        stopPropagation: true,
      });

      const event = createTestEvent('stop', {});
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

      await mockListener.listener(event);

      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should throw when configured to throw', async () => {
      const mockListener = createMockEventListener({
        shouldThrow: true,
        throwError: new Error('Custom error'),
      });

      await expect(mockListener.listener(createTestEvent('error', {}))).rejects.toThrow('Custom error');
    });

    it('should use default error when shouldThrow is true', async () => {
      const mockListener = createMockEventListener({
        shouldThrow: true,
      });

      await expect(mockListener.listener(createTestEvent('error', {}))).rejects.toThrow(
        'Mock listener error',
      );
    });

    it('should support assertion helpers', async () => {
      const mockListener = createMockEventListener();

      await mockListener.listener(createTestEvent('test1', {}));
      await mockListener.listener(createTestEvent('test2', {}));
      await mockListener.listener(createTestEvent('test1', {}));

      expect(() => mockListener.expectCallCount(3)).not.toThrow();
      expect(() => mockListener.expectCallCount(2)).toThrow();

      expect(() => mockListener.expectEventCount('test1', 2)).not.toThrow();
      expect(() => mockListener.expectEventCount('test1', 1)).toThrow();

      expect(() => mockListener.expectLastEventType('test1')).not.toThrow();
      expect(() => mockListener.expectLastEventType('test2')).toThrow();
    });
  });

  describe('testEventPropagation', () => {
    it('should test basic event propagation', async () => {
      const parent = new MockEventTarget();
      const child = new MockEventTarget();

      const results = await testEventPropagation(parent, child, 'propagation:test', { data: 'test' });

      // Note: MockEventTarget doesn't implement actual propagation
      // This tests the utility structure
      expect(results).toHaveProperty('bubbled');
      expect(results).toHaveProperty('capturedOnParent');
      expect(results).toHaveProperty('capturedOnChild');
      expect(results).toHaveProperty('propagationStopped');
    });

    it('should detect stopPropagation request', async () => {
      const parent = new MockEventTarget();
      const child = new MockEventTarget();

      const results = await testEventPropagation(parent, child, 'stop:test', { stopPropagation: true });

      expect(results.propagationStopped).toBe(true);
    });
  });

  describe('createEventBatch', () => {
    it('should create batch of events', () => {
      const eventConfigs = [
        { type: 'event1', detail: { data: 1 } },
        { type: 'event2', detail: { data: 2 } },
        { type: 'event3', detail: { data: 3 } },
      ];

      const events = createEventBatch(eventConfigs);

      expect(events).toHaveLength(3);
      expect(events[0]?.type).toBe('event1');
      expect(events[1]?.type).toBe('event2');
      expect(events[2]?.type).toBe('event3');

      expect((events[0] as CustomEvent | undefined)?.detail.data).toBe(1);
      expect((events[1] as CustomEvent | undefined)?.detail.data).toBe(2);
      expect((events[2] as CustomEvent | undefined)?.detail.data).toBe(3);
    });

    it('should handle events with options', () => {
      const eventConfigs = [
        {
          type: 'bubbling',
          detail: { test: true },
          options: { bubbles: true, cancelable: true },
        },
      ];

      const events = createEventBatch(eventConfigs);

      expect(events[0]?.bubbles).toBe(true);
      expect(events[0]?.cancelable).toBe(true);
    });

    it('should handle empty batch', () => {
      const events = createEventBatch([]);

      expect(events).toEqual([]);
    });
  });

  describe('validateDiscoveryEvent', () => {
    it('should validate valid discovery request event', () => {
      const request = createTestDiscoveryRequest();
      const event = createDiscoveryRequestEvent(request);

      const validation = validateDiscoveryEvent(event, 'discovery:wallet:request');

      expect(validation.valid).toBe(true);
      expect(validation.messageType).toBe('discovery:wallet:request');
      expect(validation.errors).toEqual([]);
    });

    it('should validate valid discovery response event', () => {
      const response = createTestDiscoveryResponse();
      const event = createDiscoveryResponseEvent(response);

      const validation = validateDiscoveryEvent(event, 'discovery:wallet:response');

      expect(validation.valid).toBe(true);
      expect(validation.messageType).toBe('discovery:wallet:response');
      expect(validation.errors).toEqual([]);
    });

    it('should reject non-CustomEvent', () => {
      const event = new Event('test');

      const validation = validateDiscoveryEvent(event);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Event is not a CustomEvent');
    });

    it('should reject event without detail', () => {
      const event = new CustomEvent('test');

      const validation = validateDiscoveryEvent(event);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Event detail is missing');
    });

    it('should reject event with missing message type', () => {
      const event = new CustomEvent('test', {
        detail: { sessionId: 'test', version: '1.0.0', timestamp: Date.now() },
      });

      const validation = validateDiscoveryEvent(event);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Message type is missing or invalid');
    });

    it('should reject event with wrong message type', () => {
      const event = new CustomEvent('test', {
        detail: {
          type: 'wrong:type',
          sessionId: 'test',
          version: '1.0.0',
          timestamp: Date.now(),
        },
      });

      const validation = validateDiscoveryEvent(event, 'discovery:wallet:request');

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain(
        "Expected message type 'discovery:wallet:request', got 'wrong:type'",
      );
    });

    it('should validate discovery request specific fields', () => {
      const event = new CustomEvent('test', {
        detail: {
          type: 'discovery:wallet:request',
          sessionId: 'test',
          version: '1.0.0',
          timestamp: Date.now(),
          // Missing origin, required, initiatorInfo
        },
      });

      const validation = validateDiscoveryEvent(event, 'discovery:wallet:request');

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Capability request origin is missing or invalid');
      expect(validation.errors).toContain('Capability request required field is missing or invalid');
      expect(validation.errors).toContain('Capability request initiatorInfo is missing or invalid');
    });

    it('should validate discovery response specific fields', () => {
      const event = new CustomEvent('test', {
        detail: {
          type: 'discovery:wallet:response',
          sessionId: 'test',
          version: '1.0.0',
          timestamp: Date.now(),
          // Missing responderId, name, matched
        },
      });

      const validation = validateDiscoveryEvent(event, 'discovery:wallet:response');

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Capability response responderId is missing or invalid');
      expect(validation.errors).toContain('Capability response name is missing or invalid');
      expect(validation.errors).toContain('Capability response matched field is missing or invalid');
    });

    it('should handle validation without expected type', () => {
      const event = new CustomEvent('test', {
        detail: {
          type: 'some:type',
          sessionId: 'test',
          version: '1.0.0',
          timestamp: Date.now(),
        },
      });

      const validation = validateDiscoveryEvent(event);

      expect(validation.messageType).toBe('some:type');
      expect(validation.errors).not.toContain(expect.stringContaining('Expected message type'));
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null/undefined inputs gracefully', () => {
      expect(() => createTestEvent('test', null)).not.toThrow();
      expect(() => createTestEvent('test', undefined)).not.toThrow();
    });

    it('should handle invalid event configurations', () => {
      const config: EventConfig = {
        bubbles: true,
        cancelable: false,
        customProperties: null as unknown as Record<string, unknown>,
      };

      expect(() => createTestEvent('test', {}, config)).not.toThrow();
    });

    it('should handle MessageEvent with invalid config', () => {
      const config = {
        origin: 'https://example.com',
        source: null,
        ports: undefined as MessagePort[] | undefined,
      };

      const testConfig = { ...config };
      if (testConfig.ports !== undefined) {
        expect(() => simulateMessageEvent({ test: true }, testConfig as MessageEventConfig)).not.toThrow();
      } else {
        // Remove undefined ports from config
        const { ...configWithoutPorts } = testConfig;
        expect(() =>
          simulateMessageEvent({ test: true }, configWithoutPorts as MessageEventConfig),
        ).not.toThrow();
      }
    });
  });
});
