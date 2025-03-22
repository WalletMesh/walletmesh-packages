import { describe, it, expect, beforeEach } from 'vitest';
import { ConnectorRegistry } from './registry.js';
import type { ConnectorCreator } from './registry.js';
import { ConnectionStatus, type Provider } from '../types.js';
import { isConnectorError, ConnectorErrorCode } from './errors.js';

describe('ConnectorRegistry', () => {
  let registry: ConnectorRegistry;
  let mockCreator: ConnectorCreator;

  beforeEach(() => {
    registry = new ConnectorRegistry();
    mockCreator = () => ({
      getProvider: async (): Promise<Provider> => ({
        request: async <T>(): Promise<T> => ({}) as T,
        connect: async () => {},
        disconnect: async () => {},
        isConnected: () => true,
      }),
      connect: async () => ({ address: '', chainId: 1, publicKey: '', connected: false }),
      disconnect: async () => {},
      getState: () => ConnectionStatus.DISCONNECTED,
      resume: async () => ({ address: '', chainId: 1, publicKey: '', connected: false }),
    });
  });

  describe('registration', () => {
    it('should register and create connectors', () => {
      registry.register('test', mockCreator);
      expect(registry.hasType('test')).toBe(true);

      const connector = registry.create({ type: 'test' });
      expect(connector).toBeDefined();
    });

    it('should validate connector type on registration', () => {
      try {
        registry.register('', mockCreator);
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(isConnectorError(error)).toBe(true);
        if (isConnectorError(error)) {
          expect(error.code).toBe(ConnectorErrorCode.INVALID_TYPE);
        }
      }
    });

    it('should validate creator function', () => {
      try {
        registry.register('test', null as unknown as ConnectorCreator);
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(isConnectorError(error)).toBe(true);
        if (isConnectorError(error)) {
          expect(error.code).toBe(ConnectorErrorCode.INVALID_CREATOR);
        }
      }
    });

    it('should unregister connectors', () => {
      registry.register('test', mockCreator);
      registry.unregister('test');
      expect(registry.hasType('test')).toBe(false);
    });
  });

  describe('creation', () => {
    it('should validate config object', () => {
      try {
        registry.create(null as unknown as { type: string });
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(isConnectorError(error)).toBe(true);
        if (isConnectorError(error)) {
          expect(error.code).toBe(ConnectorErrorCode.INVALID_CONFIG);
        }
      }
    });

    it('should handle missing connector type', () => {
      try {
        registry.create({ type: 'nonexistent' });
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(isConnectorError(error)).toBe(true);
        if (isConnectorError(error)) {
          expect(error.code).toBe(ConnectorErrorCode.NOT_REGISTERED);
        }
      }
    });

    it('should handle creator errors', () => {
      const error = new Error('Creation failed');
      const failingCreator: ConnectorCreator = () => {
        throw error;
      };

      registry.register('test', failingCreator);

      try {
        registry.create({ type: 'test' });
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(isConnectorError(error)).toBe(true);
        if (isConnectorError(error)) {
          expect(error.code).toBe(ConnectorErrorCode.CONNECTOR_ERROR);
        }
      }
    });

    it('should handle creator throwing non-Error', () => {
      const failingCreator: ConnectorCreator = () => {
        throw 'Creation failed';
      };

      registry.register('test', failingCreator);

      try {
        registry.create({ type: 'test' });
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(isConnectorError(error)).toBe(true);
        if (isConnectorError(error)) {
          expect(error.code).toBe(ConnectorErrorCode.CONNECTOR_ERROR);
          expect(error.message).toBe('Creation failed');
        }
      }
    });
  });

  describe('utilities', () => {
    it('should list registered types', () => {
      registry.register('test1', mockCreator);
      registry.register('test2', mockCreator);
      expect(registry.getTypes()).toContain('test1');
      expect(registry.getTypes()).toContain('test2');
    });

    it('should clear all registrations', () => {
      registry.register('test1', mockCreator);
      registry.register('test2', mockCreator);
      registry.clear();
      expect(registry.getTypes()).toHaveLength(0);
    });

    it('should handle type checks gracefully', () => {
      expect(registry.hasType('')).toBe(false);
      expect(registry.hasType('nonexistent')).toBe(false);
    });
  });
});
