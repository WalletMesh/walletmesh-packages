/**
 * @packageDocumentation
 * Tests for mock connector implementation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MockConnector, type MockConnectorConfig } from './mock.js';
import { TransportError } from '../transport/types.js';
import type { WalletInfo, WalletState } from '../types.js';

describe('MockConnector', () => {
  let connector: MockConnector;
  const defaultConfig: MockConnectorConfig = {
    address: '0xTEST',
    chainId: '1234',
    responseDelay: 0,
  };

  // Test wallet info used across all tests
  const testWalletInfo: WalletInfo = {
    id: 'test',
    name: 'Test Wallet',
    connector: {
      type: 'mock',
      options: {},
    },
  };

  beforeEach(() => {
    connector = new MockConnector(defaultConfig);
  });

  describe('connection management', () => {
    it('should connect successfully', async () => {
      const wallet = await connector.connect(testWalletInfo);
      expect(wallet.info.id).toBe('mock');
      expect(wallet.state.address).toBe(defaultConfig.address);
      expect(wallet.state.networkId).toBe(defaultConfig.chainId);
      expect(connector.isConnected()).toBe(true);
    });

    it('should fail to connect when configured', async () => {
      connector = new MockConnector({ ...defaultConfig, shouldFail: true });
      await expect(connector.connect(testWalletInfo)).rejects.toThrow(TransportError);
      await expect(connector.connect(testWalletInfo)).rejects.toThrow('Failed to connect wallet');
    });

    it('should not allow multiple connections', async () => {
      await connector.connect(testWalletInfo);
      await expect(connector.connect(testWalletInfo)).rejects.toThrow('Connector already connected');
    });

    it('should resume connection', async () => {
      // Ensure required state values
      if (!defaultConfig.address || !defaultConfig.chainId) {
        throw new Error('Test configuration missing required values');
      }

      const state: WalletState = {
        address: defaultConfig.address,
        networkId: defaultConfig.chainId,
        sessionId: 'test-session',
      };

      const wallet = await connector.resume(testWalletInfo, state);
      expect(wallet.info.id).toBe('mock');
      expect(wallet.state.address).toBe(defaultConfig.address);
      expect(wallet.state.networkId).toBe(defaultConfig.chainId);
    });

    it('should disconnect', async () => {
      await connector.connect(testWalletInfo);
      expect(connector.isConnected()).toBe(true);

      await connector.disconnect();
      expect(connector.isConnected()).toBe(false);
    });

    it('should handle disconnect when not connected', async () => {
      await expect(connector.disconnect()).resolves.not.toThrow();
    });
  });

  describe('provider management', () => {
    it('should return mock provider', async () => {
      const provider = await connector.getProvider();
      expect(provider).toBeDefined();
      expect(provider.address).toBe(defaultConfig.address);
      expect(provider.chainId).toBe(defaultConfig.chainId);
    });
  });

  describe('message handling', () => {
    it('should handle incoming messages', () => {
      const consoleSpy = vi.spyOn(console, 'error');

      connector.handleMessage({ invalid: 'message' });
      expect(consoleSpy).not.toHaveBeenCalled();

      connector.handleMessage({
        id: '1',
        type: 'response',
        payload: { test: true },
        timestamp: Date.now(),
      });
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should respect response delay', async () => {
      const delay = 100;
      connector = new MockConnector({ ...defaultConfig, responseDelay: delay });

      // Use Promise based timing for more accurate measurement
      const startTime = performance.now();
      await connector.connect(testWalletInfo);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Allow for some timing variation but ensure minimum delay
      expect(duration).toBeGreaterThanOrEqual(delay - 5);
    });
  });

  describe('error handling', () => {
    it('should handle connection errors', async () => {
      connector = new MockConnector({ shouldFail: true });
      await expect(connector.connect(testWalletInfo)).rejects.toThrow(TransportError);
    });

    it('should cleanup on connection failure', async () => {
      connector = new MockConnector({ shouldFail: true });
      try {
        await connector.connect(testWalletInfo);
      } catch {
        expect(connector.isConnected()).toBe(false);
        expect(connector.getConnectedWallet()).toBeNull();
      }
    });
  });
});
