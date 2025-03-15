/**
 * @packageDocumentation
 * Tests for connector registry implementation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConnectorRegistry } from './registry.js';
import { BaseConnector } from './base.js';
import type { ConnectorImplementationConfig } from '../types.js';

class TestConnector extends BaseConnector {
  async getProvider(): Promise<unknown> {
    return {};
  }

  protected handleProtocolMessage(): void {
    // No-op for test
  }
}

describe('ConnectorRegistry', () => {
  let registry: ConnectorRegistry;
  const mockConfig: ConnectorImplementationConfig = {
    type: 'test',
    transport: {
      connect: vi.fn(),
      disconnect: vi.fn(),
      send: vi.fn(),
      subscribe: vi.fn(),
      isConnected: vi.fn(),
    },
    protocol: {
      parseMessage: vi.fn(),
      formatMessage: vi.fn(),
      validateMessage: vi.fn(),
      createRequest: vi.fn(),
      createResponse: vi.fn(),
      createError: vi.fn(),
    },
  };

  beforeEach(() => {
    registry = new ConnectorRegistry();
  });

  describe('registration', () => {
    it('should register a connector creator', () => {
      registry.register('test', (config) => new TestConnector(config));
      expect(registry.hasType('test')).toBe(true);
    });

    it('should not allow duplicate registration', () => {
      registry.register('test', (config) => new TestConnector(config));

      expect(() => {
        registry.register('test', (config) => new TestConnector(config));
      }).toThrow("Connector type 'test' is already registered");
    });

    it('should return registered types', () => {
      registry.register('test1', (config) => new TestConnector(config));
      registry.register('test2', (config) => new TestConnector(config));

      const types = registry.getTypes();
      expect(types).toHaveLength(2);
      expect(types).toContain('test1');
      expect(types).toContain('test2');
    });

    it('should unregister a connector type', () => {
      registry.register('test', (config) => new TestConnector(config));
      expect(registry.hasType('test')).toBe(true);

      registry.unregister('test');
      expect(registry.hasType('test')).toBe(false);
    });

    it('should clear all registrations', () => {
      registry.register('test1', (config) => new TestConnector(config));
      registry.register('test2', (config) => new TestConnector(config));
      expect(registry.getTypes()).toHaveLength(2);

      registry.clear();
      expect(registry.getTypes()).toHaveLength(0);
    });
  });

  describe('connector creation', () => {
    it('should create a connector instance', () => {
      registry.register('test', (config) => new TestConnector(config));

      const connector = registry.create(mockConfig);
      expect(connector).toBeInstanceOf(BaseConnector);
    });

    it('should throw for unknown connector type', () => {
      expect(() => {
        registry.create({ ...mockConfig, type: 'unknown' });
      }).toThrow("No connector registered for type 'unknown'");
    });

    it('should pass config to creator', () => {
      const creator = vi.fn((config) => new TestConnector(config));
      registry.register('test', creator);

      registry.create(mockConfig);
      expect(creator).toHaveBeenCalledWith(mockConfig);
    });
  });

  describe('type checking', () => {
    it('should check for registered types', () => {
      expect(registry.hasType('test')).toBe(false);

      registry.register('test', (config) => new TestConnector(config));
      expect(registry.hasType('test')).toBe(true);
    });

    it('should handle unregistering unknown type', () => {
      expect(() => {
        registry.unregister('unknown');
      }).not.toThrow();
    });
  });

  describe('default registry', () => {
    it('should have mock connector registered', () => {
      const registry = new ConnectorRegistry();
      expect(registry.hasType('mock')).toBe(false); // Fresh registry has no connectors
    });

    it('should create registered connector', () => {
      const registry = new ConnectorRegistry();
      registry.register('test', (config) => new TestConnector(config));

      const connector = registry.create(mockConfig);
      expect(connector).toBeInstanceOf(TestConnector);
    });

    it('should fail to create unregistered connector', () => {
      const registry = new ConnectorRegistry();
      expect(() => registry.create({ ...mockConfig, type: 'unknown' })).toThrow(
        "No connector registered for type 'unknown'",
      );
    });
  });
});
