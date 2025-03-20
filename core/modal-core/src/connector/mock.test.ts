/**
 * @packageDocumentation
 * Tests for mock connector
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConnectionStatus } from '../types.js';
import type { WalletInfo } from '../types.js';
import { MockConnector, type MockConnectorConfig } from './mock.js';

describe('MockConnector', () => {
  let connector: MockConnector;
  let mockWalletInfo: WalletInfo;
  let config: MockConnectorConfig;

  beforeEach(() => {
    config = {
      address: '0x1234567890123456789012345678901234567890', // Default address
      chainId: 1,
      shouldFail: false,
      responseDelay: 0
    };

    connector = new MockConnector(config);

    mockWalletInfo = {
      address: config.address ?? '0x1234567890123456789012345678901234567890',
      chainId: config.chainId ?? 1,
      publicKey: '0x456' // Add a fallback value
    };
  });

  describe('connection management', () => {
    it('should handle connect flow', async () => {
      const result = await connector.connect(mockWalletInfo);
      expect(result.address).toBe(config.address ?? '0x1234567890123456789012345678901234567890');
      expect(result.chainId).toBe(config.chainId ?? 1);
      expect(result.connected).toBe(true);
    });

    it('should handle disconnect flow', async () => {
      await connector.connect(mockWalletInfo);
      await connector.disconnect();
      expect(connector.getState()).toBe(ConnectionStatus.DISCONNECTED);
    });

    it('should provide connection state', async () => {
      expect(connector.getState()).toBe(ConnectionStatus.DISCONNECTED);
      await connector.connect(mockWalletInfo);
      expect(connector.getState()).toBe(ConnectionStatus.CONNECTED);
    });

    it('should handle connection failures', async () => {
      connector = new MockConnector({ ...config, shouldFail: true });
      await expect(connector.connect(mockWalletInfo)).rejects.toThrow();
    });
  });

  describe('provider management', () => {
    it('should return provider instance', async () => {
      const provider = await connector.getProvider();
      expect(provider).toBeDefined();
      expect(typeof provider.request).toBe('function');
    });

    it('should handle delayed responses', async () => {
      connector = new MockConnector({ ...config, responseDelay: 100 });
      const startTime = Date.now();
      await connector.connect(mockWalletInfo);
      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });
  });
});
