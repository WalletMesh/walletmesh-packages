/**
 * @file Tests for EventEmitter implementation
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventEmitter } from './eventEmitter.js';

describe('EventEmitter', () => {
  let emitter: EventEmitter;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    emitter = new EventEmitter();
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('on', () => {
    it('should add event listener', () => {
      const listener = vi.fn();
      emitter.on('test', listener);

      expect(emitter.listenerCount('test')).toBe(1);
      expect(emitter.eventNames()).toContain('test');
    });

    it('should add multiple listeners for same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      emitter.on('test', listener1);
      emitter.on('test', listener2);

      expect(emitter.listenerCount('test')).toBe(2);
    });

    it('should add listeners for different events', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      emitter.on('event1', listener1);
      emitter.on('event2', listener2);

      expect(emitter.listenerCount('event1')).toBe(1);
      expect(emitter.listenerCount('event2')).toBe(1);
      expect(emitter.eventNames()).toContain('event1');
      expect(emitter.eventNames()).toContain('event2');
    });
  });

  describe('off', () => {
    it('should remove specific listener', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      emitter.on('test', listener1);
      emitter.on('test', listener2);
      emitter.off('test', listener1);

      expect(emitter.listenerCount('test')).toBe(1);
    });

    it('should remove event from map when no listeners remain', () => {
      const listener = vi.fn();

      emitter.on('test', listener);
      emitter.off('test', listener);

      expect(emitter.listenerCount('test')).toBe(0);
      expect(emitter.eventNames()).not.toContain('test');
    });

    it('should handle removing non-existent listener', () => {
      const listener = vi.fn();

      expect(() => emitter.off('test', listener)).not.toThrow();
      expect(emitter.listenerCount('test')).toBe(0);
    });

    it('should handle removing listener from non-existent event', () => {
      const listener = vi.fn();

      expect(() => emitter.off('nonexistent', listener)).not.toThrow();
    });
  });

  describe('once', () => {
    it('should call listener only once', () => {
      const listener = vi.fn();

      emitter.once('test', listener);
      emitter.emit('test', 'data1');
      emitter.emit('test', 'data2');

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('data1');
    });

    it('should remove listener after first call', () => {
      const listener = vi.fn();

      emitter.once('test', listener);
      expect(emitter.listenerCount('test')).toBe(1);

      emitter.emit('test', 'data');
      expect(emitter.listenerCount('test')).toBe(0);
    });

    it('should work with multiple once listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      emitter.once('test', listener1);
      emitter.once('test', listener2);

      emitter.emit('test', 'data');

      expect(listener1).toHaveBeenCalledWith('data');
      expect(listener2).toHaveBeenCalledWith('data');
      expect(emitter.listenerCount('test')).toBe(0);
    });
  });

  describe('emit', () => {
    it('should call all listeners with data', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const data = { test: 'value' };

      emitter.on('test', listener1);
      emitter.on('test', listener2);
      emitter.emit('test', data);

      expect(listener1).toHaveBeenCalledWith(data);
      expect(listener2).toHaveBeenCalledWith(data);
    });

    it('should handle emitting to non-existent event', () => {
      expect(() => emitter.emit('nonexistent', 'data')).not.toThrow();
    });

    it('should catch and log listener errors', () => {
      const goodListener = vi.fn();
      const badListener = vi.fn(() => {
        throw new Error('Listener error');
      });

      emitter.on('test', goodListener);
      emitter.on('test', badListener);

      emitter.emit('test', 'data');

      expect(goodListener).toHaveBeenCalledWith('data');
      expect(badListener).toHaveBeenCalledWith('data');
      expect(consoleSpy).toHaveBeenCalledWith('Event listener error:', expect.any(Error));
    });

    it('should continue calling other listeners after error', () => {
      const listener1 = vi.fn();
      const badListener = vi.fn(() => {
        throw new Error('Error');
      });
      const listener3 = vi.fn();

      emitter.on('test', listener1);
      emitter.on('test', badListener);
      emitter.on('test', listener3);

      emitter.emit('test', 'data');

      expect(listener1).toHaveBeenCalledWith('data');
      expect(listener3).toHaveBeenCalledWith('data');
    });

    it('should call listeners in order they were added', () => {
      const calls: number[] = [];
      const listener1 = vi.fn(() => calls.push(1));
      const listener2 = vi.fn(() => calls.push(2));
      const listener3 = vi.fn(() => calls.push(3));

      emitter.on('test', listener1);
      emitter.on('test', listener2);
      emitter.on('test', listener3);

      emitter.emit('test', 'data');

      expect(calls).toEqual([1, 2, 3]);
    });
  });

  describe('eventNames', () => {
    it('should return empty array when no events', () => {
      expect(emitter.eventNames()).toEqual([]);
    });

    it('should return array of event names', () => {
      emitter.on('event1', vi.fn());
      emitter.on('event2', vi.fn());
      emitter.on('event3', vi.fn());

      const names = emitter.eventNames();
      expect(names).toContain('event1');
      expect(names).toContain('event2');
      expect(names).toContain('event3');
      expect(names).toHaveLength(3);
    });

    it('should not include events with no listeners', () => {
      const listener = vi.fn();

      emitter.on('test', listener);
      emitter.off('test', listener);

      expect(emitter.eventNames()).not.toContain('test');
    });
  });

  describe('listenerCount', () => {
    it('should return 0 for non-existent event', () => {
      expect(emitter.listenerCount('nonexistent')).toBe(0);
    });

    it('should return correct count for event with listeners', () => {
      emitter.on('test', vi.fn());
      emitter.on('test', vi.fn());
      emitter.on('test', vi.fn());

      expect(emitter.listenerCount('test')).toBe(3);
    });

    it('should update count when listeners are removed', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      emitter.on('test', listener1);
      emitter.on('test', listener2);
      expect(emitter.listenerCount('test')).toBe(2);

      emitter.off('test', listener1);
      expect(emitter.listenerCount('test')).toBe(1);

      emitter.off('test', listener2);
      expect(emitter.listenerCount('test')).toBe(0);
    });
  });

  describe('removeAllListeners', () => {
    it('should remove all listeners for specific event', () => {
      emitter.on('event1', vi.fn());
      emitter.on('event1', vi.fn());
      emitter.on('event2', vi.fn());

      emitter.removeAllListeners('event1');

      expect(emitter.listenerCount('event1')).toBe(0);
      expect(emitter.listenerCount('event2')).toBe(1);
      expect(emitter.eventNames()).not.toContain('event1');
      expect(emitter.eventNames()).toContain('event2');
    });

    it('should remove all listeners for all events when no event specified', () => {
      emitter.on('event1', vi.fn());
      emitter.on('event2', vi.fn());
      emitter.on('event3', vi.fn());

      emitter.removeAllListeners();

      expect(emitter.eventNames()).toEqual([]);
      expect(emitter.listenerCount('event1')).toBe(0);
      expect(emitter.listenerCount('event2')).toBe(0);
      expect(emitter.listenerCount('event3')).toBe(0);
    });

    it('should handle removing listeners from non-existent event', () => {
      expect(() => emitter.removeAllListeners('nonexistent')).not.toThrow();
    });
  });

  describe('type safety', () => {
    it('should work with typed events', () => {
      interface TestEvents {
        'user:login': { id: number; name: string };
        'user:logout': { id: number };
      }

      const loginListener = vi.fn<[TestEvents['user:login']], void>();
      const logoutListener = vi.fn<[TestEvents['user:logout']], void>();

      emitter.on<TestEvents['user:login']>('user:login', loginListener);
      emitter.on<TestEvents['user:logout']>('user:logout', logoutListener);

      emitter.emit('user:login', { id: 123, name: 'Alice' });
      emitter.emit('user:logout', { id: 123 });

      expect(loginListener).toHaveBeenCalledWith({ id: 123, name: 'Alice' });
      expect(logoutListener).toHaveBeenCalledWith({ id: 123 });
    });
  });

  describe('memory management', () => {
    it('should clean up empty event sets', () => {
      const listener = vi.fn();

      emitter.on('test', listener);
      expect(emitter.eventNames()).toContain('test');

      emitter.off('test', listener);
      expect(emitter.eventNames()).not.toContain('test');
    });

    it('should handle rapid add/remove cycles', () => {
      const listener = vi.fn();

      // Add and remove multiple times
      for (let i = 0; i < 100; i++) {
        emitter.on('test', listener);
        emitter.off('test', listener);
      }

      expect(emitter.listenerCount('test')).toBe(0);
      expect(emitter.eventNames()).not.toContain('test');
    });
  });
});
