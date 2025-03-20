import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseConnector } from '../base.js';
import type { ConnectedWallet, WalletInfo } from '../../types.js';
import { ConnectionStatus } from '../../types.js';
import type { Protocol, ProtocolMessage, Transport, Provider } from '../types.js';
import type { Message, ValidationResult } from '../../transport/types.js';
import { MessageType } from '../../transport/types.js';
import { TransportError, TransportErrorCode, ProtocolError, ProtocolErrorCode } from '../../transport/errors.js';

// Define test message type
interface TestMessage extends ProtocolMessage {
  request: {
    method: string;
    params: unknown[];
  };
  response: {
    result?: unknown;
    error?: string;
  };
}

describe('BaseConnector', () => {
  class TestConnector extends BaseConnector<TestMessage> {
    private connectionState = ConnectionStatus.DISCONNECTED;
    protected override currentWallet: ConnectedWallet | null = null;

    protected async doConnect(walletInfo: WalletInfo): Promise<void> {
      await this.transport.connect();
      this.connectionState = ConnectionStatus.CONNECTED;
      this.currentWallet = this.createConnectedWallet(walletInfo);
    }

    protected async doDisconnect(): Promise<void> {
      await this.transport.disconnect();
      this.connectionState = ConnectionStatus.DISCONNECTED;
      this.currentWallet = null;
    }

    public override async getProvider(): Promise<Provider> {
      return {
        request: async <T>(method: string, params: unknown[] = []): Promise<T> => {
          const result = await this.request(method, params);
          return result as T;
        },
        connect: async () => {},
        disconnect: async () => {},
        isConnected: () => this.isConnected()
      };
    }

    protected async handleProtocolMessage(message: Message<TestMessage>): Promise<void> {
      const validationResult = this.protocol.validateMessage(message);
     if (!validationResult.success) {
       throw new ProtocolError(validationResult.error.message, validationResult.error.code);
     }
 
     if (validationResult.data.type === MessageType.REQUEST) {
        const response = this.protocol.createResponse(message.id, {
          result: true
        });
        await this.transport.send(response);
      }
    }

    protected override createConnectedWallet(info: WalletInfo): ConnectedWallet {
      return {
        address: info.address,
        chainId: info.chainId,
        publicKey: info.publicKey || '0x',
        connected: true,
        state: {
          sessionId: 'test-session',
          networkId: info.chainId,
          address: info.address,
          lastActive: Date.now()
        }
      };
    }

    public override isConnected(): boolean {
      return this.connectionState === ConnectionStatus.CONNECTED;
    }

    public override getState(): ConnectionStatus {
      return this.connectionState;
    }

    // Test helper
    public async testRequest<TReq = unknown, TRes = unknown>(
      method: string,
      params: TReq[]
    ): Promise<TRes> {
      return this.sendRequest(method, params);
    }
  }

  let connector: TestConnector;
  let mockTransport: Transport;
  let mockProtocol: Protocol<TestMessage>;
  let testWalletInfo: WalletInfo;

  beforeEach(() => {
    const createMockMessage = (id: string, type: MessageType): Message<TestMessage> => ({
      id,
      type,
      payload: {
        request: { method: 'test', params: [] },
        response: { result: true }
      },
      timestamp: Date.now()
    });

    mockTransport = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockImplementation((msg: Message<TestMessage>) => 
        Promise.resolve(createMockMessage(msg.id, MessageType.RESPONSE))
      ),
      isConnected: vi.fn().mockImplementation(() => connector?.isConnected() ?? false),
      getState: vi.fn().mockReturnValue('connected'),
      subscribe: vi.fn().mockReturnValue(() => {}),
      addErrorHandler: vi.fn(),
      removeErrorHandler: vi.fn()
    };

    mockProtocol = {
      createRequest: vi.fn().mockImplementation(() =>
        createMockMessage('1', MessageType.REQUEST)
      ),
      createResponse: vi.fn().mockImplementation((id: string) =>
        createMockMessage(id, MessageType.RESPONSE)
      ),
      createError: vi.fn().mockImplementation((id: string) =>
        createMockMessage(id, MessageType.ERROR)
      ),
      validateMessage: vi.fn().mockImplementation((msg: unknown): ValidationResult<Message<TestMessage>> => ({
        success: true,
        data: msg as Message<TestMessage>
      })),
      formatMessage: vi.fn().mockReturnValue(''),
      parseMessage: vi.fn().mockImplementation((): ValidationResult<Message<TestMessage>> => ({
        success: true,
        data: createMockMessage('1', MessageType.RESPONSE)
      }))
    };

    testWalletInfo = {
      address: '0x123',
      chainId: 1,
      publicKey: '0x456'
    };

    connector = new TestConnector(mockTransport, mockProtocol);
  });

  describe('wallet management', () => {
    it('should connect successfully', async () => {
      const wallet = await connector.connect(testWalletInfo);
      expect(connector.isConnected()).toBe(true);
      expect(wallet.address).toBe(testWalletInfo.address);
      expect(mockTransport.connect).toHaveBeenCalled();
    });

    it('should resume connection', async () => {
      const timestamp = Date.now();
      const state = {
        sessionId: 'test-session',
        networkId: testWalletInfo.chainId,
        address: testWalletInfo.address,
        lastActive: timestamp
      };

      const wallet = await connector.resume(testWalletInfo, state);
      expect(connector.isConnected()).toBe(true);
      expect(wallet.address).toBe(testWalletInfo.address);
      expect(wallet.state).toMatchObject({
        ...state,
        lastActive: expect.any(Number)
      });
    });

    it('should handle disconnection', async () => {
      await connector.connect(testWalletInfo);
      expect(connector.isConnected()).toBe(true);

      await connector.disconnect();
      expect(connector.isConnected()).toBe(false);
      expect(mockTransport.disconnect).toHaveBeenCalled();
    });
  });

  describe('message handling', () => {
    beforeEach(async () => {
      await connector.connect(testWalletInfo);
    });

    it('should send requests', async () => {
      const response = await connector.testRequest('test', ['param1']);
      expect(mockTransport.send).toHaveBeenCalled();
      expect(response).toBeDefined();
    });

    it('should validate connection state before sending', async () => {
      await connector.disconnect();
      await expect(connector.testRequest('test', [])).rejects.toThrow(TransportError);
    });

    it('should handle transport errors', async () => {
      vi.mocked(mockTransport.send).mockRejectedValueOnce(
        new TransportError('Test error', TransportErrorCode.CONNECTION_FAILED)
      );

      await expect(connector.testRequest('test', [])).rejects.toThrow(TransportError);
    });

    it('should handle protocol validation errors', async () => {
      vi.mocked(mockProtocol.validateMessage).mockReturnValueOnce({
        success: false,
        error: new ProtocolError('Invalid message', ProtocolErrorCode.INVALID_FORMAT)
      });

      await expect(connector.testRequest('test', [])).rejects.toThrow(ProtocolError);
    });
  });

  describe('state management', () => {
    it('should track connection state', async () => {
      expect(connector.getState()).toBe(ConnectionStatus.DISCONNECTED);
      
      await connector.connect(testWalletInfo);
      expect(connector.getState()).toBe(ConnectionStatus.CONNECTED);
      
      await connector.disconnect();
      expect(connector.getState()).toBe(ConnectionStatus.DISCONNECTED);
    });

    it('should handle provider creation', async () => {
      await connector.connect(testWalletInfo);
      const provider = await connector.getProvider();
      expect(provider).toBeDefined();
      expect(provider.isConnected()).toBe(true);
    });

    it('should handle provider creation when disconnected', async () => {
      const provider = await connector.getProvider();
      expect(provider).toBeDefined();
      expect(provider.isConnected()).toBe(false);
    });
  });
});