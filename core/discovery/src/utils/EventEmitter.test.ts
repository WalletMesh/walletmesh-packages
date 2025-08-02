import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from './EventEmitter.js';

describe('EventEmitter', () => {
  let emitter: EventEmitter;

  beforeEach(() => {
    emitter = new EventEmitter();
    vi.clearAllMocks();
  });

  describe('on()', () => {
    it('should add a listener for an event', () => {
      const listener = vi.fn();
      emitter.on('test', listener);

      expect(emitter.listenerCount('test')).toBe(1);
      expect(emitter.listeners('test')).toContain(listener);
    });

    it('should add multiple listeners for the same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      emitter.on('test', listener1);
      emitter.on('test', listener2);

      expect(emitter.listenerCount('test')).toBe(2);
      expect(emitter.listeners('test')).toContain(listener1);
      expect(emitter.listeners('test')).toContain(listener2);
    });

    it('should return this for chaining', () => {
      const result = emitter.on('test', vi.fn());
      expect(result).toBe(emitter);
    });

    it('should warn when max listeners exceeded', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      emitter.setMaxListeners(2);

      emitter.on('test', vi.fn());
      emitter.on('test', vi.fn());
      emitter.on('test', vi.fn()); // This should trigger warning

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Possible EventEmitter memory leak detected'),
      );
    });

    it('should not warn when maxListeners is 0', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      emitter.setMaxListeners(0);

      // Add many listeners
      for (let i = 0; i < 20; i++) {
        emitter.on('test', vi.fn());
      }

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should support symbol events', () => {
      const sym = Symbol('test');
      const listener = vi.fn();

      emitter.on(sym, listener);

      expect(emitter.listenerCount(sym)).toBe(1);
      expect(emitter.listeners(sym)).toContain(listener);
    });
  });

  describe('once()', () => {
    it('should add a one-time listener', () => {
      const listener = vi.fn();
      emitter.once('test', listener);

      emitter.emit('test', 'arg1', 'arg2');
      expect(listener).toHaveBeenCalledWith('arg1', 'arg2');
      expect(listener).toHaveBeenCalledTimes(1);

      // Should not be called again
      emitter.emit('test', 'arg3', 'arg4');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should remove the listener after first emit', () => {
      const listener = vi.fn();
      emitter.once('test', listener);

      expect(emitter.listenerCount('test')).toBe(1);
      emitter.emit('test');
      expect(emitter.listenerCount('test')).toBe(0);
    });

    it('should return this for chaining', () => {
      const result = emitter.once('test', vi.fn());
      expect(result).toBe(emitter);
    });
  });

  describe('removeListener()', () => {
    it('should remove a specific listener', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      emitter.on('test', listener1);
      emitter.on('test', listener2);

      emitter.removeListener('test', listener1);

      expect(emitter.listenerCount('test')).toBe(1);
      expect(emitter.listeners('test')).not.toContain(listener1);
      expect(emitter.listeners('test')).toContain(listener2);
    });

    it('should remove event key when no listeners remain', () => {
      const listener = vi.fn();
      emitter.on('test', listener);

      expect(emitter.eventNames()).toContain('test');

      emitter.removeListener('test', listener);

      expect(emitter.eventNames()).not.toContain('test');
    });

    it('should handle removing non-existent listener', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      emitter.on('test', listener1);

      // Remove listener that was never added
      emitter.removeListener('test', listener2);

      expect(emitter.listenerCount('test')).toBe(1);
      expect(emitter.listeners('test')).toContain(listener1);
    });

    it('should handle removing from non-existent event', () => {
      const listener = vi.fn();

      // Should not throw
      expect(() => {
        emitter.removeListener('nonexistent', listener);
      }).not.toThrow();
    });

    it('should return this for chaining', () => {
      const result = emitter.removeListener('test', vi.fn());
      expect(result).toBe(emitter);
    });
  });

  describe('off()', () => {
    it('should be an alias for removeListener', () => {
      const listener = vi.fn();
      emitter.on('test', listener);

      emitter.off('test', listener);

      expect(emitter.listenerCount('test')).toBe(0);
    });
  });

  describe('removeAllListeners()', () => {
    it('should remove all listeners for a specific event', () => {
      emitter.on('test1', vi.fn());
      emitter.on('test1', vi.fn());
      emitter.on('test2', vi.fn());

      emitter.removeAllListeners('test1');

      expect(emitter.listenerCount('test1')).toBe(0);
      expect(emitter.listenerCount('test2')).toBe(1);
    });

    it('should remove all listeners when no event specified', () => {
      emitter.on('test1', vi.fn());
      emitter.on('test2', vi.fn());
      emitter.on('test3', vi.fn());

      emitter.removeAllListeners();

      expect(emitter.eventNames()).toHaveLength(0);
    });

    it('should return this for chaining', () => {
      const result = emitter.removeAllListeners();
      expect(result).toBe(emitter);
    });
  });

  describe('emit()', () => {
    it('should call all listeners with arguments', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      emitter.on('test', listener1);
      emitter.on('test', listener2);

      const result = emitter.emit('test', 'arg1', 'arg2', 'arg3');

      expect(result).toBe(true);
      expect(listener1).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
      expect(listener2).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });

    it('should return false when no listeners', () => {
      const result = emitter.emit('nonexistent');
      expect(result).toBe(false);
    });

    it('should handle listener errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Listener error');
      const badListener = vi.fn().mockImplementation(() => {
        throw error;
      });
      const goodListener = vi.fn();

      emitter.on('test', badListener);
      emitter.on('test', goodListener);

      const result = emitter.emit('test');

      expect(result).toBe(true);
      expect(badListener).toHaveBeenCalled();
      expect(goodListener).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('[WalletMesh] Error in event listener:', error);
    });

    it('should work with symbol events', () => {
      const sym = Symbol('test');
      const listener = vi.fn();

      emitter.on(sym, listener);
      const result = emitter.emit(sym, 'data');

      expect(result).toBe(true);
      expect(listener).toHaveBeenCalledWith('data');
    });
  });

  describe('listenerCount()', () => {
    it('should return the number of listeners for an event', () => {
      expect(emitter.listenerCount('test')).toBe(0);

      emitter.on('test', vi.fn());
      expect(emitter.listenerCount('test')).toBe(1);

      emitter.on('test', vi.fn());
      expect(emitter.listenerCount('test')).toBe(2);
    });

    it('should return 0 for non-existent events', () => {
      expect(emitter.listenerCount('nonexistent')).toBe(0);
    });
  });

  describe('listeners()', () => {
    it('should return a copy of listeners array', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      emitter.on('test', listener1);
      emitter.on('test', listener2);

      const listeners = emitter.listeners('test');

      expect(listeners).toHaveLength(2);
      expect(listeners).toContain(listener1);
      expect(listeners).toContain(listener2);

      // Verify it's a copy
      listeners.push(vi.fn());
      expect(emitter.listenerCount('test')).toBe(2);
    });

    it('should return empty array for non-existent events', () => {
      const listeners = emitter.listeners('nonexistent');
      expect(listeners).toEqual([]);
    });
  });

  describe('eventNames()', () => {
    it('should return all event names', () => {
      const sym = Symbol('test');

      emitter.on('event1', vi.fn());
      emitter.on('event2', vi.fn());
      emitter.on(sym, vi.fn());

      const names = emitter.eventNames();

      expect(names).toHaveLength(3);
      expect(names).toContain('event1');
      expect(names).toContain('event2');
      expect(names).toContain(sym);
    });

    it('should return empty array when no events', () => {
      expect(emitter.eventNames()).toEqual([]);
    });
  });

  describe('setMaxListeners() / getMaxListeners()', () => {
    it('should set and get max listeners', () => {
      expect(emitter.getMaxListeners()).toBe(10); // default

      emitter.setMaxListeners(20);
      expect(emitter.getMaxListeners()).toBe(20);

      emitter.setMaxListeners(0);
      expect(emitter.getMaxListeners()).toBe(0);
    });

    it('should return this for chaining', () => {
      const result = emitter.setMaxListeners(5);
      expect(result).toBe(emitter);
    });
  });

  describe('prependListener()', () => {
    it('should add listener to the beginning', () => {
      const listener1 = vi.fn().mockReturnValue('first');
      const listener2 = vi.fn().mockReturnValue('second');

      emitter.on('test', listener1);
      emitter.prependListener('test', listener2);

      const listeners = emitter.listeners('test');
      expect(listeners[0]).toBe(listener2);
      expect(listeners[1]).toBe(listener1);
    });

    it('should warn when max listeners exceeded', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      emitter.setMaxListeners(1);

      emitter.on('test', vi.fn());
      emitter.prependListener('test', vi.fn()); // This should trigger warning

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Possible EventEmitter memory leak detected'),
      );
    });

    it('should return this for chaining', () => {
      const result = emitter.prependListener('test', vi.fn());
      expect(result).toBe(emitter);
    });
  });

  describe('prependOnceListener()', () => {
    it('should add one-time listener to the beginning', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      emitter.on('test', listener1);
      emitter.prependOnceListener('test', listener2);

      emitter.emit('test');

      // Both should be called
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      // Only listener1 should remain
      expect(emitter.listenerCount('test')).toBe(1);

      emitter.emit('test');
      expect(listener1).toHaveBeenCalledTimes(2);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('should return this for chaining', () => {
      const result = emitter.prependOnceListener('test', vi.fn());
      expect(result).toBe(emitter);
    });
  });

  describe('edge cases', () => {
    it('should handle multiple removes of the same listener', () => {
      const listener = vi.fn();

      emitter.on('test', listener);
      emitter.removeListener('test', listener);
      emitter.removeListener('test', listener); // Second remove

      expect(emitter.listenerCount('test')).toBe(0);
    });

    it('should handle emit during emit', () => {
      const results: string[] = [];

      emitter.on('test', () => {
        results.push('listener1');
        emitter.emit('nested');
      });

      emitter.on('nested', () => {
        results.push('nested');
      });

      emitter.on('test', () => {
        results.push('listener2');
      });

      emitter.emit('test');

      expect(results).toEqual(['listener1', 'nested', 'listener2']);
    });

    it('should handle adding listener during emit', () => {
      let callCount = 0;

      emitter.on('test', () => {
        callCount++;
        if (callCount === 1) {
          emitter.on('test', () => {
            callCount++;
          });
        }
      });

      emitter.emit('test');
      expect(callCount).toBe(1); // New listener not called in same emit

      emitter.emit('test');
      expect(callCount).toBe(3); // Both listeners called
    });

    it('should handle removing listener during emit', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn(() => {
        emitter.removeListener('test', listener3);
      });
      const listener3 = vi.fn();

      emitter.on('test', listener1);
      emitter.on('test', listener2);
      emitter.on('test', listener3);

      emitter.emit('test');

      // All listeners should still be called since we use a copy
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
      expect(listener3).toHaveBeenCalled();

      // But listener3 should be removed for next emit
      expect(emitter.listenerCount('test')).toBe(2);
    });
  });
});
