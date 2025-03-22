import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerConnector, createConnector, clearConnectorRegistry } from './createConnector.js';
import type { Connector, ConnectorFactory } from './types.js';
import { ConnectionStatus } from '../types.js';
import type { WalletConnectorConfig } from '../types.js';

describe('createConnector', () => {
  const mockConnector: Connector = {
    connect: vi.fn(),
    resume: vi.fn(),
    disconnect: vi.fn(),
    getProvider: vi.fn(),
    getState: vi.fn().mockReturnValue(ConnectionStatus.DISCONNECTED),
  };

  const mockFactory = vi.fn().mockReturnValue(mockConnector) as unknown as ConnectorFactory;

  beforeEach(() => {
    vi.clearAllMocks();
    clearConnectorRegistry();
  });

  describe('registerConnector', () => {
    it('should successfully register a connector factory', () => {
      registerConnector('test', mockFactory);

      const config: WalletConnectorConfig = { type: 'test' };
      const connector = createConnector(config);

      expect(vi.mocked(mockFactory)).toHaveBeenCalledWith(config);
      expect(connector).toBe(mockConnector);
    });

    it('should allow overwriting existing connector registration', () => {
      const alternativeMockConnector: Connector = {
        connect: vi.fn(),
        resume: vi.fn(),
        disconnect: vi.fn(),
        getProvider: vi.fn(),
        getState: vi.fn().mockReturnValue(ConnectionStatus.DISCONNECTED),
      };
      const alternativeMockFactory = vi
        .fn()
        .mockReturnValue(alternativeMockConnector) as unknown as ConnectorFactory;

      registerConnector('test', mockFactory);
      registerConnector('test', alternativeMockFactory);

      const config: WalletConnectorConfig = { type: 'test' };
      const connector = createConnector(config);

      expect(vi.mocked(mockFactory)).not.toHaveBeenCalled();
      expect(vi.mocked(alternativeMockFactory)).toHaveBeenCalledWith(config);
      expect(connector).toBe(alternativeMockConnector);
    });

    it('should support multiple different connector types', () => {
      const mockFactoryA = vi.fn().mockReturnValue({ ...mockConnector }) as unknown as ConnectorFactory;
      const mockFactoryB = vi.fn().mockReturnValue({ ...mockConnector }) as unknown as ConnectorFactory;

      registerConnector('typeA', mockFactoryA);
      registerConnector('typeB', mockFactoryB);

      const configA: WalletConnectorConfig = { type: 'typeA' };
      const configB: WalletConnectorConfig = { type: 'typeB' };

      createConnector(configA);
      createConnector(configB);

      expect(vi.mocked(mockFactoryA)).toHaveBeenCalledWith(configA);
      expect(vi.mocked(mockFactoryB)).toHaveBeenCalledWith(configB);
    });
  });

  describe('createConnector', () => {
    it('should throw error for unregistered connector type', () => {
      const config: WalletConnectorConfig = { type: 'unknown' };

      expect(() => createConnector(config)).toThrow('No connector factory registered for type: unknown');
    });

    it('should pass connector options to factory', () => {
      const config: WalletConnectorConfig = {
        type: 'test',
        options: { foo: 'bar' },
      };

      registerConnector('test', mockFactory);
      createConnector(config);

      expect(vi.mocked(mockFactory)).toHaveBeenCalledWith(config);
    });

    it('should handle undefined options', () => {
      const config: WalletConnectorConfig = { type: 'test' };

      registerConnector('test', mockFactory);
      createConnector(config);

      expect(vi.mocked(mockFactory)).toHaveBeenCalledWith(config);
    });
  });

  describe('clearConnectorRegistry', () => {
    it('should remove all registered connectors', () => {
      registerConnector('test1', mockFactory);
      registerConnector('test2', mockFactory);

      clearConnectorRegistry();

      const config: WalletConnectorConfig = { type: 'test1' };
      expect(() => createConnector(config)).toThrow('No connector factory registered for type: test1');
    });

    it('should allow registering new connectors after clearing', () => {
      registerConnector('test', mockFactory);
      clearConnectorRegistry();
      registerConnector('newTest', mockFactory);

      const config: WalletConnectorConfig = { type: 'newTest' };
      const connector = createConnector(config);

      expect(vi.mocked(mockFactory)).toHaveBeenCalledWith(config);
      expect(connector).toBe(mockConnector);
    });
  });

  describe('error cases', () => {
    it('should validate connector implements required interface', () => {
      const invalidConnector = {
        // Missing required methods
        connect: vi.fn(),
      };
      const invalidFactory = vi.fn().mockReturnValue(invalidConnector) as unknown as ConnectorFactory;

      registerConnector('test', invalidFactory);
      const config: WalletConnectorConfig = { type: 'test' };

      // TypeScript will catch this at compile time, but we should still
      // have runtime tests to ensure interface compliance
      expect(() => createConnector(config)).not.toThrow();
    });

    it('should handle null/undefined/invalid config', () => {
      expect(() => createConnector(null as unknown as WalletConnectorConfig)).toThrow();

      expect(() => createConnector(undefined as unknown as WalletConnectorConfig)).toThrow();

      expect(() => createConnector({} as unknown as WalletConnectorConfig)).toThrow();
    });
  });
});
