/**
 * @packageDocumentation
 * Tests for mock connector
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConnectionStatus } from '../types.js';
import type { WalletInfo } from '../types.js';
import { MockConnector, type MockConnectorConfig, type MockMessageTypes } from './mock.js';
import { MessageType, type Message } from '../transport/index.js';
import { ProtocolErrorCode } from '../transport/errors.js';
import type { Protocol, Transport } from './types.js';

type MockConnectorInternals = {
  transport: Transport;
  protocol: Protocol<MockMessageTypes>;
};

describe('MockConnector', () => {
  let connector: MockConnector;
  let mockWalletInfo: WalletInfo;
  let config: MockConnectorConfig;

  beforeEach(() => {
    config = {
      address: '0x1234567890123456789012345678901234567890',
      chainId: 1,
      shouldFail: false,
      responseDelay: 0,
    };

    connector = new MockConnector(config);

    mockWalletInfo = {
      address: config.address ?? '0x1234567890123456789012345678901234567890',
      chainId: config.chainId ?? 1,
      publicKey: '0x456',
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

    it('should handle legacy config format', async () => {
      const legacyConfig = {
        type: 'mock',
        name: 'Mock Wallet',
        options: {
          address: '0xabc',
          chainId: 5,
          shouldFail: false,
        },
      };
      connector = new MockConnector(legacyConfig);
      const result = await connector.connect(mockWalletInfo);
      expect(result.address).toBe(legacyConfig.options.address);
      expect(result.chainId).toBe(legacyConfig.options.chainId);
    });
  });

  describe('provider management', () => {
    it('should return provider instance', async () => {
      const provider = await connector.getProvider();
      expect(provider).toBeDefined();
      expect(typeof provider.request).toBe('function');
    });

    it('should handle delayed responses', { timeout: 2000 }, async () => {
      // Test immediate connection without delay first
      connector = new MockConnector(config);
      await connector.connect(mockWalletInfo);
      expect(connector.isConnected()).toBe(true);
      await connector.disconnect();
      expect(connector.isConnected()).toBe(false);

      // Now test with delay
      connector = new MockConnector({ ...config, responseDelay: 100 });
      const connectPromise = connector.connect(mockWalletInfo);
      await new Promise((resolve) => setTimeout(resolve, 200));
      await connectPromise;
      expect(connector.isConnected()).toBe(true);
    });

    it('should maintain connection state through provider methods', async () => {
      const provider = await connector.getProvider();
      expect(connector.isConnected()).toBe(false);

      await provider.connect();
      expect(connector.isConnected()).toBe(true);

      await provider.disconnect();
      expect(connector.isConnected()).toBe(false);
    });

    it('should handle provider requests', async () => {
      const provider = await connector.getProvider();
      const result = await provider.request();
      expect(result).toEqual({});
    });
  });

  describe('protocol handling', () => {
    it('should create valid request messages', () => {
      const internals = connector as unknown as MockConnectorInternals;

      const request = internals.protocol.createRequest('test', { method: 'test', params: [1, 2] });
      expect(request.type).toBe(MessageType.REQUEST);
      expect(request.payload.method).toBe('test');
      expect(request.payload.params).toEqual([1, 2]);
    });

    it('should create valid response messages', () => {
      const internals = connector as unknown as MockConnectorInternals;

      const response = internals.protocol.createResponse('test-id', { result: true });
      expect(response.type).toBe(MessageType.RESPONSE);
      expect(response.id).toBe('test-id');
      expect(response.payload.result).toBe(true);
    });

    it('should create valid error messages', () => {
      const internals = connector as unknown as MockConnectorInternals;
      const error = new Error('Test error');

      const errorMessage = internals.protocol.createError('test-id', error);
      expect(errorMessage.type).toBe(MessageType.ERROR);
      expect(errorMessage.id).toBe('test-id');
      expect(errorMessage.payload.method).toBe('error');
      expect(errorMessage.payload.params).toEqual([error.message]);
    });

    it('should validate messages correctly', () => {
      const internals = connector as unknown as MockConnectorInternals;

      const validResult = internals.protocol.validateMessage({
        id: 'test',
        type: MessageType.REQUEST,
        payload: { method: 'test', params: [] },
        timestamp: Date.now(),
      });
      expect(validResult.success).toBe(true);

      const invalidResult = internals.protocol.validateMessage(null);
      if (!invalidResult.success) {
        expect(invalidResult.error.code).toBe(ProtocolErrorCode.INVALID_FORMAT);
      } else {
        throw new Error('Expected validation to fail');
      }
    });

    it('should process protocol messages', async () => {
      const message: Message<MockMessageTypes['request']> = {
        id: 'test',
        type: MessageType.REQUEST,
        payload: { method: 'connect', params: [] },
        timestamp: Date.now(),
      };

      connector.processTestMessage(message);
      expect(connector.isConnected()).toBe(true);
    });

    it('should handle transport send with delay', { timeout: 2000 }, async () => {
      connector = new MockConnector({ ...config, responseDelay: 100 });
      const internals = connector as unknown as MockConnectorInternals;

      const sendPromise = internals.transport.send<{ test: boolean }, { result: boolean }>({
        id: 'test',
        type: MessageType.REQUEST,
        payload: { test: true },
        timestamp: Date.now(),
      });

      await new Promise((resolve) => setTimeout(resolve, 200));
      const response = await sendPromise;

      expect(response.type).toBe(MessageType.RESPONSE);
      expect(response.payload.result).toBe(true);
    });
  });
});
