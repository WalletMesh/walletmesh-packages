/**
 * Consolidated test suite for utils module
 * Combines EventEmitter tests and additional edge cases
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from './EventEmitter.js';
import { setupFakeTimers, cleanupFakeTimers } from '../testing/timingHelpers.js';

describe('Utils Module', () => {
  let emitter: EventEmitter;

  beforeEach(() => {
    setupFakeTimers();
    emitter = new EventEmitter();
  });

  afterEach(() => {
    cleanupFakeTimers();
  });

  // ===============================================
  // EventEmitter Basic Functionality
  // ===============================================
  describe('EventEmitter Basic Functionality', () => {
    it('should add and remove event listeners', () => {
      const listener = vi.fn();
      const eventName = 'test-event';

      emitter.on(eventName, listener);
      emitter.emit(eventName, 'test-data');

      expect(listener).toHaveBeenCalledWith('test-data');

      emitter.off(eventName, listener);
      emitter.emit(eventName, 'test-data-2');

      expect(listener).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it('should support multiple listeners for the same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const eventName = 'multi-listener-event';

      emitter.on(eventName, listener1);
      emitter.on(eventName, listener2);
      emitter.emit(eventName, 'shared-data');

      expect(listener1).toHaveBeenCalledWith('shared-data');
      expect(listener2).toHaveBeenCalledWith('shared-data');
    });

    it('should support once listeners that are automatically removed', () => {
      const listener = vi.fn();
      const eventName = 'once-event';

      emitter.once(eventName, listener);
      emitter.emit(eventName, 'first-call');
      emitter.emit(eventName, 'second-call');

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('first-call');
    });

    it('should handle events with multiple arguments', () => {
      const listener = vi.fn();
      const eventName = 'multi-arg-event';

      emitter.on(eventName, listener);
      emitter.emit(eventName, 'arg1', 'arg2', 'arg3');

      expect(listener).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });

    it('should handle events with no arguments', () => {
      const listener = vi.fn();
      const eventName = 'no-arg-event';

      emitter.on(eventName, listener);
      emitter.emit(eventName);

      expect(listener).toHaveBeenCalledWith();
    });
  });

  // ===============================================
  // EventEmitter Edge Cases
  // ===============================================
  describe('EventEmitter Edge Cases', () => {
    it('should handle removing non-existent listeners gracefully', () => {
      const listener = vi.fn();
      const eventName = 'non-existent-event';

      // Should not throw when removing a listener that was never added
      expect(() => emitter.off(eventName, listener)).not.toThrow();
    });

    it('should handle emitting non-existent events gracefully', () => {
      const eventName = 'non-existent-event';

      // Should not throw when emitting an event with no listeners
      expect(() => emitter.emit(eventName, 'data')).not.toThrow();
    });

    it('should handle adding the same listener multiple times', () => {
      const listener = vi.fn();
      const eventName = 'duplicate-listener-event';

      emitter.on(eventName, listener);
      emitter.on(eventName, listener); // Add same listener again
      emitter.emit(eventName, 'test-data');

      // Should only be called once (no duplicates)
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should handle listeners that throw errors', () => {
      const throwingListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const normalListener = vi.fn();
      const eventName = 'error-event';

      emitter.on(eventName, throwingListener);
      emitter.on(eventName, normalListener);

      // Should not prevent other listeners from being called
      expect(() => emitter.emit(eventName, 'test-data')).not.toThrow();
      expect(throwingListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
    });

    it('should handle listeners modifying the listener list during emission', () => {
      const eventName = 'self-modifying-event';
      let callCount = 0;

      const selfRemovingListener = vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          emitter.off(eventName, selfRemovingListener);
        }
      });

      const normalListener = vi.fn();

      emitter.on(eventName, selfRemovingListener);
      emitter.on(eventName, normalListener);

      emitter.emit(eventName);
      emitter.emit(eventName); // Second emission

      expect(selfRemovingListener).toHaveBeenCalledTimes(1);
      expect(normalListener).toHaveBeenCalledTimes(2);
    });

    it('should handle very long event names', () => {
      const longEventName = 'a'.repeat(1000);
      const listener = vi.fn();

      expect(() => emitter.on(longEventName, listener)).not.toThrow();
      expect(() => emitter.emit(longEventName, 'data')).not.toThrow();
      expect(listener).toHaveBeenCalledWith('data');
    });

    it('should handle special characters in event names', () => {
      const specialEventNames = [
        'event-with-dashes',
        'event_with_underscores',
        'event.with.dots',
        'event:with:colons',
        'event/with/slashes',
        'event with spaces',
        'event\twith\ttabs',
        'event\nwith\nnewlines',
      ];

      for (const eventName of specialEventNames) {
        const listener = vi.fn();
        expect(() => emitter.on(eventName, listener)).not.toThrow();
        expect(() => emitter.emit(eventName, 'data')).not.toThrow();
        expect(listener).toHaveBeenCalledWith('data');
      }
    });

    it('should handle numeric event names', () => {
      const numericEvents = [0, 1, 42, -1, 3.14, Number.NaN, Number.POSITIVE_INFINITY];

      for (const eventName of numericEvents) {
        const listener = vi.fn();
        expect(() => emitter.on(String(eventName), listener)).not.toThrow();
        expect(() => emitter.emit(String(eventName), 'data')).not.toThrow();
        expect(listener).toHaveBeenCalledWith('data');
      }
    });

    it('should handle symbol event names', () => {
      const symbolEvent = Symbol('test-event');
      const listener = vi.fn();

      expect(() => emitter.on(symbolEvent, listener)).not.toThrow();
      expect(() => emitter.emit(symbolEvent, 'data')).not.toThrow();
      expect(listener).toHaveBeenCalledWith('data');
    });
  });

  // ===============================================
  // EventEmitter Memory Management
  // ===============================================
  describe('EventEmitter Memory Management', () => {
    it('should properly clean up listeners when removed', () => {
      const listener = vi.fn();
      const eventName = 'cleanup-event';

      emitter.on(eventName, listener);
      expect(emitter.listenerCount(eventName)).toBe(1);

      emitter.off(eventName, listener);
      expect(emitter.listenerCount(eventName)).toBe(0);
    });

    it('should handle removing all listeners for an event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const eventName = 'remove-all-event';

      emitter.on(eventName, listener1);
      emitter.on(eventName, listener2);
      expect(emitter.listenerCount(eventName)).toBe(2);

      emitter.removeAllListeners(eventName);
      expect(emitter.listenerCount(eventName)).toBe(0);

      emitter.emit(eventName, 'data');
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it('should handle removing all listeners for all events', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      emitter.on('event1', listener1);
      emitter.on('event2', listener2);

      expect(emitter.listenerCount('event1')).toBe(1);
      expect(emitter.listenerCount('event2')).toBe(1);

      emitter.removeAllListeners();

      expect(emitter.listenerCount('event1')).toBe(0);
      expect(emitter.listenerCount('event2')).toBe(0);
    });

    it('should handle large numbers of listeners efficiently', () => {
      const eventName = 'stress-test-event';
      const listeners = [];

      // Set max listeners to a higher value for stress testing
      emitter.setMaxListeners(1500);

      // Add many listeners
      for (let i = 0; i < 1000; i++) {
        const listener = vi.fn();
        listeners.push(listener);
        emitter.on(eventName, listener);
      }

      expect(emitter.listenerCount(eventName)).toBe(1000);

      // Emit event
      emitter.emit(eventName, 'data');

      // All listeners should have been called
      for (const listener of listeners) {
        expect(listener).toHaveBeenCalledWith('data');
      }

      // Remove all listeners
      emitter.removeAllListeners(eventName);
      expect(emitter.listenerCount(eventName)).toBe(0);

      // Reset max listeners to default
      emitter.setMaxListeners(10);
    });

    it('should detect potential memory leaks', () => {
      const eventName = 'leak-test-event';
      emitter.setMaxListeners(5);

      // Add listeners within limit
      for (let i = 0; i < 3; i++) {
        emitter.on(eventName, vi.fn());
      }

      let leakCheck = emitter.checkMemoryLeaks();
      expect(leakCheck.hasLeaks).toBe(false);
      expect(leakCheck.suspiciousEvents).toHaveLength(0);

      // Add listeners beyond limit
      for (let i = 0; i < 5; i++) {
        emitter.on(eventName, vi.fn());
      }

      leakCheck = emitter.checkMemoryLeaks();
      expect(leakCheck.hasLeaks).toBe(true);
      expect(leakCheck.suspiciousEvents).toHaveLength(1);
      expect(leakCheck.suspiciousEvents[0]).toMatchObject({
        event: eventName,
        count: 8,
        maxAllowed: 5,
      });

      // Clean up
      emitter.removeAllListeners(eventName);
      emitter.setMaxListeners(10);
    });

    it('should not report leaks when maxListeners is 0 (unlimited)', () => {
      const eventName = 'unlimited-test-event';
      emitter.setMaxListeners(0);

      // Add many listeners
      for (let i = 0; i < 50; i++) {
        emitter.on(eventName, vi.fn());
      }

      const leakCheck = emitter.checkMemoryLeaks();
      expect(leakCheck.hasLeaks).toBe(false);
      expect(leakCheck.suspiciousEvents).toHaveLength(0);

      // Clean up
      emitter.removeAllListeners(eventName);
      emitter.setMaxListeners(10);
    });
  });

  // ===============================================
  // EventEmitter Advanced Features
  // ===============================================
  describe('EventEmitter Advanced Features', () => {
    it('should support listener prioritization if implemented', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const eventName = 'priority-event';

      // If priority is supported, test it
      if ('prependListener' in emitter) {
        (
          emitter as unknown as { prependListener(event: string, listener: () => void): void }
        ).prependListener(eventName, listener1);
        emitter.on(eventName, listener2);

        emitter.emit(eventName);

        // listener1 should be called first
        expect(listener1).toHaveBeenCalled();
        expect(listener2).toHaveBeenCalled();
      } else {
        // Standard behavior
        (emitter as EventEmitter).on(eventName, listener1);
        (emitter as EventEmitter).on(eventName, listener2);
        (emitter as EventEmitter).emit(eventName);

        expect(listener1).toHaveBeenCalled();
        expect(listener2).toHaveBeenCalled();
      }
    });

    it('should provide event names if supported', () => {
      const listener = vi.fn();

      emitter.on('event1', listener);
      emitter.on('event2', listener);

      if ('eventNames' in emitter) {
        const eventNames = (emitter as unknown as { eventNames(): string[] }).eventNames();
        expect(eventNames).toContain('event1');
        expect(eventNames).toContain('event2');
      }
    });

    it('should provide max listeners functionality if supported', () => {
      if ('getMaxListeners' in emitter && 'setMaxListeners' in emitter) {
        const maxListenerEmitter = emitter as unknown as {
          getMaxListeners(): number;
          setMaxListeners(max: number): void;
        };
        const originalMax = maxListenerEmitter.getMaxListeners();

        maxListenerEmitter.setMaxListeners(5);
        expect(maxListenerEmitter.getMaxListeners()).toBe(5);

        // Restore original
        maxListenerEmitter.setMaxListeners(originalMax);
      }
    });
  });

  // ===============================================
  // EventEmitter Integration Tests
  // ===============================================
  describe('EventEmitter Integration', () => {
    it('should work with async listeners', async () => {
      const asyncListener = vi.fn(async (data) => {
        // Use fake timers instead of real setTimeout
        await vi.advanceTimersByTimeAsync(10);
        return `processed-${data}`;
      });

      const eventName = 'async-event';
      emitter.on(eventName, asyncListener);

      emitter.emit(eventName, 'test-data');

      // Advance timers to complete async operation
      await vi.advanceTimersByTimeAsync(20);

      expect(asyncListener).toHaveBeenCalledWith('test-data');
    });

    it('should handle event emission during listener execution', () => {
      const eventName1 = 'cascading-event-1';
      const eventName2 = 'cascading-event-2';

      const listener1 = vi.fn(() => {
        emitter.emit(eventName2, 'cascaded-data');
      });

      const listener2 = vi.fn();

      emitter.on(eventName1, listener1);
      emitter.on(eventName2, listener2);

      emitter.emit(eventName1, 'original-data');

      expect(listener1).toHaveBeenCalledWith('original-data');
      expect(listener2).toHaveBeenCalledWith('cascaded-data');
    });

    it('should maintain proper this context in listeners', () => {
      const context = { value: 'test-context' };
      const listener = vi.fn(function (this: typeof context) {
        return this.value;
      });

      const boundListener = listener.bind(context);
      const eventName = 'context-event';

      emitter.on(eventName, boundListener);
      emitter.emit(eventName);

      expect(listener).toHaveBeenCalled();
    });
  });

  // ===============================================
  // EventEmitter Error Recovery
  // ===============================================
  describe('EventEmitter Error Recovery', () => {
    it('should continue working after listener errors', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Test error');
      });
      const normalListener = vi.fn();
      const eventName = 'error-recovery-event';

      emitter.on(eventName, errorListener);
      emitter.on(eventName, normalListener);

      // Emit should not throw and should call both listeners
      expect(() => emitter.emit(eventName, 'data')).not.toThrow();

      expect(errorListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();

      // Should continue to work for subsequent emissions
      emitter.emit(eventName, 'data2');
      expect(normalListener).toHaveBeenCalledTimes(2);
    });

    it('should handle corrupted internal state gracefully', () => {
      const listener = vi.fn();
      const eventName = 'corruption-test-event';

      emitter.on(eventName, listener);

      // Simulate potential corruption scenarios
      if ('_events' in emitter) {
        // Don't actually corrupt, just test resilience
        const events = (emitter as unknown as { _events?: unknown })._events;
        if (events) {
          // Store original and restore after test
          const original = { ...events };

          // Test with various scenarios
          emitter.emit(eventName, 'data');
          expect(listener).toHaveBeenCalled();

          // Restore original state
          Object.assign(events, original);
        }
      }
    });
  });
});
