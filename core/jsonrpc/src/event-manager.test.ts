import { describe, it, expect, vi } from 'vitest';
import { EventManager } from './event-manager.js';
import type { JSONRPCEventMap } from './types.js';

interface TestEventMap extends JSONRPCEventMap {
  'user.joined': { username: string };
  'user.left': { username: string };
  'chat.message': { text: string; from: string };
  eth_accounts: string[];
  eth_balance: { address: string; balance: string };
  'system.error': { code: number; message: string };
}

describe('EventManager', () => {
  describe('Basic Event Handling', () => {
    it('should register and handle exact event matches', () => {
      const manager = new EventManager<TestEventMap>();
      const handler = vi.fn();

      manager.on('user.joined', handler);
      manager.handleEvent('user.joined', { username: 'Alice' });

      expect(handler).toHaveBeenCalledWith({ username: 'Alice' });
    });

    it('should allow multiple handlers for the same event', () => {
      const manager = new EventManager<TestEventMap>();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      manager.on('chat.message', handler1);
      manager.on('chat.message', handler2);

      const event = { text: 'Hello', from: 'Bob' };
      manager.handleEvent('chat.message', event);

      expect(handler1).toHaveBeenCalledWith(event);
      expect(handler2).toHaveBeenCalledWith(event);
    });

    it('should handle errors in event handlers gracefully', () => {
      const manager = new EventManager<TestEventMap>();
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error');
      });
      const normalHandler = vi.fn();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      manager.on('user.joined', errorHandler);
      manager.on('user.joined', normalHandler);

      manager.handleEvent('user.joined', { username: 'Dave' });

      expect(errorHandler).toHaveBeenCalled();
      expect(normalHandler).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Pattern Matching', () => {
    it('should match wildcard patterns', () => {
      const manager = new EventManager<TestEventMap>();
      const userHandler = vi.fn();
      const ethHandler = vi.fn();
      const errorHandler = vi.fn();

      manager.on('user.*', userHandler);
      manager.on('eth_*', ethHandler);
      manager.on('*.error', errorHandler);

      // Test user.* pattern
      manager.handleEvent('user.joined', { username: 'Alice' });
      manager.handleEvent('user.left', { username: 'Bob' });
      expect(userHandler).toHaveBeenCalledTimes(2);

      // Test eth_* pattern
      manager.handleEvent('eth_accounts', ['0x123']);
      manager.handleEvent('eth_balance', { address: '0x123', balance: '100' });
      expect(ethHandler).toHaveBeenCalledTimes(2);

      // Test *.error pattern
      manager.handleEvent('system.error', { code: 404, message: 'Not found' });
      expect(errorHandler).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple patterns matching same event', () => {
      const manager = new EventManager<TestEventMap>();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      manager.on('user.*', handler1);
      manager.on('*.joined', handler2);

      manager.handleEvent('user.joined', { username: 'Alice' });

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should properly clean up pattern handlers', () => {
      const manager = new EventManager<TestEventMap>();
      const handler = vi.fn();

      const cleanup = manager.on('user.*', handler);
      cleanup();

      manager.handleEvent('user.joined', { username: 'Alice' });
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Handler Management', () => {
    it('should remove handlers when cleanup function is called', () => {
      const manager = new EventManager<TestEventMap>();
      const handler = vi.fn();

      const cleanup = manager.on('chat.message', handler);
      cleanup();

      manager.handleEvent('chat.message', { text: 'Hello', from: 'Alice' });
      expect(handler).not.toHaveBeenCalled();
    });

    it('should get all handlers for an event', () => {
      const manager = new EventManager<TestEventMap>();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      manager.on('user.joined', handler1);
      manager.on('user.joined', handler2);

      const handlers = manager.getHandlers('user.joined');
      expect(handlers).toBeDefined();
      expect(handlers?.size).toBe(2);
      expect(handlers?.has(handler1)).toBe(true);
      expect(handlers?.has(handler2)).toBe(true);
    });

    it('should return undefined when no handlers exist', () => {
      const manager = new EventManager<TestEventMap>();
      const handlers = manager.getHandlers('nonexistent.event');
      expect(handlers).toBeUndefined();
    });

    it('should check handler existence correctly', () => {
      const manager = new EventManager<TestEventMap>();
      const handler = vi.fn();

      expect(manager.hasHandlers('user.joined')).toBe(false);

      manager.on('user.joined', handler);
      expect(manager.hasHandlers('user.joined')).toBe(true);

      const cleanup = manager.on('user.joined', vi.fn());
      cleanup();
      expect(manager.hasHandlers('user.joined')).toBe(true);

      const cleanup2 = manager.on('chat.message', vi.fn());
      cleanup2();
      expect(manager.hasHandlers('chat.message')).toBe(false);
    });

    it('should remove all handlers', () => {
      const manager = new EventManager<TestEventMap>();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      manager.on('user.joined', handler1);
      manager.on('user.*', handler2);

      manager.removeAllHandlers();

      manager.handleEvent('user.joined', { username: 'Alice' });
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });
});
