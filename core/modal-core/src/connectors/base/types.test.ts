import { describe, it, expect, vi } from 'vitest';
import {
  ConnectorNotInitializedError,
  ConnectionInProgressError,
  ConnectionTimeoutError,
  createInitialState,
  type ProviderFactory,
  type EventManager,
} from './types.js';
import { ProviderInterface } from '../../types/providers.js';
import { ChainType } from '../../types/chains.js';

describe('Base Connector Error Types', () => {
  describe('ConnectorNotInitializedError', () => {
    it('should create error with correct message and name', () => {
      const error = new ConnectorNotInitializedError();
      expect(error.message).toBe('Connector not initialized');
      expect(error.name).toBe('ConnectorNotInitializedError');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('ConnectionInProgressError', () => {
    it('should create error with correct message and name', () => {
      const error = new ConnectionInProgressError();
      expect(error.message).toBe('Connection already in progress');
      expect(error.name).toBe('ConnectionInProgressError');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('ConnectionTimeoutError', () => {
    it('should create error with correct message and name', () => {
      const timeout = 5000;
      const error = new ConnectionTimeoutError(timeout);
      expect(error.message).toBe(`Connection timed out after ${timeout}ms`);
      expect(error.name).toBe('ConnectionTimeoutError');
      expect(error).toBeInstanceOf(Error);
    });
  });
});

describe('Base Connector Interfaces', () => {
  describe('EventManager', () => {
    it('should handle event listeners correctly', () => {
      const manager: EventManager = {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
      };

      const listener = () => {};
      manager.on('test', listener);
      expect(manager.on).toHaveBeenCalledWith('test', listener);

      manager.off('test', listener);
      expect(manager.off).toHaveBeenCalledWith('test', listener);

      manager.emit('test', 'arg1', 'arg2');
      expect(manager.emit).toHaveBeenCalledWith('test', 'arg1', 'arg2');
    });
  });

  describe('ProviderFactory', () => {
    it('should create provider and get capabilities', () => {
      const factory: ProviderFactory = {
        createProvider: vi.fn(),
        getCapabilities: vi.fn(),
      };

      factory.createProvider(ProviderInterface.EIP1193, ChainType.ETHEREUM);
      expect(factory.createProvider).toHaveBeenCalledWith(ProviderInterface.EIP1193, ChainType.ETHEREUM);

      factory.getCapabilities(ProviderInterface.EIP1193);
      expect(factory.getCapabilities).toHaveBeenCalledWith(ProviderInterface.EIP1193);
    });
  });

  describe('createInitialState', () => {
    it('should create initial state with correct defaults', () => {
      const state = createInitialState();
      expect(state).toEqual({
        connectionState: 'disconnected',
        chain: null,
        provider: null,
        accounts: [],
        error: null,
      });
    });
  });
});
