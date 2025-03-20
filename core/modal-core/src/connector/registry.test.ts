import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConnectorRegistry } from './registry.js';
import { MockConnector } from './MockConnector.js';
import type { ConnectorImplementationConfig } from '../types.js';
import { ConnectionStatus } from '../types.js';

describe('ConnectorRegistry', () => {
  let registry: ConnectorRegistry;
  let mockConfig: ConnectorImplementationConfig;

  beforeEach(() => {
    registry = new ConnectorRegistry();
    mockConfig = {
      type: 'mock',
      name: 'Mock Connector',
      factory: async () => ({
        request: async <T>(): Promise<T> => ({} as T),
        connect: async () => {},
        disconnect: async () => {},
        isConnected: () => true
      })
    };
  });

  describe('registration', () => {
    it('should register a connector creator', () => {
      const creator = (config: ConnectorImplementationConfig) => new MockConnector(config);
      registry.register('test', creator);
      expect(registry.hasType('test')).toBe(true);
    });

    it('should not allow duplicate registration', () => {
      const creator = (config: ConnectorImplementationConfig) => new MockConnector(config);
      registry.register('test', creator);

      expect(() => {
        registry.register('test', creator);
      }).toThrow("Connector type 'test' is already registered");
    });

    it('should validate connector type on registration', () => {
      expect(() => {
        registry.register('', () => new MockConnector(mockConfig));
      }).toThrow('Invalid connector type');

      expect(() => {
        registry.register(' ', () => new MockConnector(mockConfig));
      }).toThrow('Invalid connector type');
    });

    it('should validate creator function', () => {
      expect(() => {
        // @ts-expect-error Testing invalid creator
        registry.register('test', null);
      }).toThrow('Creator must be a function');
    });

    it('should return registered types', () => {
      registry.register('test1', (config: ConnectorImplementationConfig) => new MockConnector(config));
      registry.register('test2', (config: ConnectorImplementationConfig) => new MockConnector(config));

      const types = registry.getTypes();
      expect(types).toHaveLength(2);
      expect(types).toContain('test1');
      expect(types).toContain('test2');
    });

    it('should unregister a connector type', () => {
      const creator = (config: ConnectorImplementationConfig) => new MockConnector(config);
      registry.register('test', creator);
      expect(registry.hasType('test')).toBe(true);

      registry.unregister('test');
      expect(registry.hasType('test')).toBe(false);
    });

    it('should clear all registrations', () => {
      registry.register('test1', (config: ConnectorImplementationConfig) => new MockConnector(config));
      registry.register('test2', (config: ConnectorImplementationConfig) => new MockConnector(config));
      expect(registry.getTypes()).toHaveLength(2);

      registry.clear();
      expect(registry.getTypes()).toHaveLength(0);
    });
  });

  describe('connector creation', () => {
    const setupMockCreator = () => {
      const creator = vi.fn((config: ConnectorImplementationConfig) => {
        const connector = new MockConnector(config);
        vi.spyOn(connector, 'getState').mockReturnValue(ConnectionStatus.DISCONNECTED);
        return connector;
      });
      registry.register('mock', creator);
      return creator;
    };

    it('should create a connector instance', () => {
      const creator = setupMockCreator();
      const connector = registry.create(mockConfig);
      
      expect(connector).toBeInstanceOf(MockConnector);
      expect(creator).toHaveBeenCalledWith(mockConfig);
    });

    it('should throw for unknown connector type', () => {
      expect(() => {
        registry.create({ ...mockConfig, type: 'unknown' });
      }).toThrow("No connector registered for type 'unknown'");
    });

    it('should validate config object', () => {
      const creator = setupMockCreator();

      expect(() => {
        registry.create({ ...mockConfig, type: '' });
      }).toThrow('Invalid connector type');
      
      // Creator should not be called with invalid config
      expect(creator).not.toHaveBeenCalled();

      expect(() => {
        registry.create({ ...mockConfig, name: '' });
      }).toThrow('Invalid connector name');

      expect(() => {
        // @ts-expect-error Testing missing factory
        registry.create({ type: 'mock', name: 'test' });
      }).toThrow('Factory function is required');
    });

    it('should pass config to creator', () => {
      const creator = setupMockCreator();
      const customConfig = {
        ...mockConfig,
        customOption: 'test'
      };

      registry.create(customConfig);
      expect(creator).toHaveBeenCalledWith(customConfig);
    });

    it('should preserve factory function', () => {
      const creator = setupMockCreator();
      const connector = registry.create(mockConfig);

      expect(connector.getState()).toBe(ConnectionStatus.DISCONNECTED);
      expect(creator).toHaveBeenCalledWith(
        expect.objectContaining({
          factory: expect.any(Function)
        })
      );
    });
  });

  describe('type checking', () => {
    it('should check for registered types', () => {
      expect(registry.hasType('test')).toBe(false);

      registry.register('test', (config: ConnectorImplementationConfig) => new MockConnector(config));
      expect(registry.hasType('test')).toBe(true);
    });

    it('should handle unregistering unknown type', () => {
      expect(() => {
        registry.unregister('unknown');
      }).not.toThrow();
    });

    it('should validate type format', () => {
      expect(registry.hasType('')).toBe(false);
      expect(registry.hasType(' ')).toBe(false);
      expect(registry.hasType('valid-type')).toBe(false);
    });

    it('should maintain type case sensitivity', () => {
      registry.register('Test', (config: ConnectorImplementationConfig) => new MockConnector(config));
      expect(registry.hasType('test')).toBe(false);
      expect(registry.hasType('Test')).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle creator errors', () => {
      const error = new Error('Creation failed');
      const failingCreator = () => {
        throw error;
      };
      
      registry.register('failing', failingCreator);
      expect(() => {
        registry.create({ ...mockConfig, type: 'failing' });
      }).toThrow(error);
    });

    it('should handle invalid configs gracefully', () => {
      const creator = (config: ConnectorImplementationConfig) => new MockConnector(config);
      registry.register('test', creator);

      expect(() => {
        // @ts-expect-error Testing invalid config
        registry.create(null);
      }).toThrow('Invalid config object');

      expect(() => {
        // @ts-expect-error Testing invalid config
        registry.create({});
      }).toThrow('Invalid connector type');
    });
  });
});
