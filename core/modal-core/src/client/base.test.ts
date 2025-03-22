import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseConnector } from '../connector/base.js';
import { MessageType } from '../transport/types.js';
import { ConnectionStatus } from '../types.js';
import type { Transport, Message, ValidationResult } from '../transport/types.js';
import type { ProtocolMessage, Provider, Protocol } from '../connector/types.js';
import type { WalletInfo, WalletState, ConnectedWallet } from '../types.js';
import { TransportError, TransportErrorCode, ProtocolError, ProtocolErrorCode } from '../transport/errors.js';

interface TestMessages extends ProtocolMessage {
  request: {
    method: string;
    params: unknown[];
  };
  response: {
    result?: unknown;
    error?: string;
  };
}

class TestConnector extends BaseConnector<TestMessages> {
  public messages: Message[] = [];
  protected override currentWallet: ConnectedWallet | null = null;
  private connected = false;

  protected async doConnect(walletInfo: WalletInfo): Promise<void> {
    this.currentWallet = this.createConnectedWallet(walletInfo);
    this.connected = true;
  }

  protected async doDisconnect(): Promise<void> {
    this.currentWallet = null;
    this.connected = false;
  }

  protected async handleProtocolMessage(message: Message<TestMessages>): Promise<void> {
    this.messages.push(message);
  }

  public override async getProvider(): Promise<Provider> {
    if (!this.isConnected()) {
      throw new Error('Not connected');
    }

    return {
      request: async <T>(method: string, params: unknown[] = []): Promise<T> => {
        const result = await this.request(method, params);
        return result as T;
      },
      connect: async () => {},
      disconnect: async () => {},
      isConnected: () => this.isConnected(),
    };
  }

  protected override createConnectedWallet(info: WalletInfo, state?: WalletState): ConnectedWallet {
    return {
      address: info.address,
      chainId: info.chainId,
      publicKey: '0x',
      connected: true,
      state: state ?? {
        sessionId: 'test-session',
        networkId: info.chainId,
        address: info.address,
        lastActive: Date.now(),
      },
    };
  }

  public override isConnected(): boolean {
    return this.connected;
  }

  public override getState(): ConnectionStatus {
    return this.connected ? ConnectionStatus.CONNECTED : ConnectionStatus.DISCONNECTED;
  }

  // Test helpers
  public getMessages(): Message[] {
    return this.messages;
  }

  public getCurrentWalletInfo(): ConnectedWallet | null {
    return this.currentWallet;
  }

  public async testRequest<TReq = unknown, TRes = unknown>(method: string, params: TReq[]): Promise<TRes> {
    return this.sendRequest(method, params);
  }
}

describe('BaseConnector', () => {
  let connector: TestConnector;
  let mockTransport: Transport;
  let mockProtocol: Protocol<TestMessages>;
  let testWallet: WalletInfo;

  beforeEach(() => {
    const connectMock = vi.fn().mockResolvedValue(undefined);
    const disconnectMock = vi.fn().mockResolvedValue(undefined);
    const sendMock = vi.fn().mockImplementation((msg: Message<TestMessages>) =>
      Promise.resolve({
        id: msg.id,
        type: MessageType.RESPONSE,
        payload: {
          request: { method: 'test', params: [] },
          response: { result: true },
        },
        timestamp: Date.now(),
      }),
    );

    mockTransport = {
      connect: connectMock,
      disconnect: disconnectMock,
      send: sendMock,
      subscribe: vi.fn().mockReturnValue(() => {}),
      isConnected: vi.fn().mockReturnValue(true),
      getState: vi.fn().mockReturnValue('connected'),
      addErrorHandler: vi.fn(),
      removeErrorHandler: vi.fn(),
    };

    const createMockMessage = (id: string, type: MessageType): Message<TestMessages> => ({
      id,
      type,
      payload: {
        request: { method: 'test', params: [] },
        response: { result: true },
      },
      timestamp: Date.now(),
    });

    const validateMessageMock = vi.fn().mockImplementation(
      (msg: unknown): ValidationResult<Message<TestMessages>> => ({
        success: true,
        data: msg as Message<TestMessages>,
      }),
    );

    mockProtocol = {
      createRequest: vi
        .fn()
        .mockImplementation((_method: string, _params: TestMessages['request']) =>
          createMockMessage('1', MessageType.REQUEST),
        ),
      createResponse: vi
        .fn()
        .mockImplementation((id: string, _result: unknown) => createMockMessage(id, MessageType.RESPONSE)),
      createError: vi
        .fn()
        .mockImplementation((id: string, _error: Error) => createMockMessage(id, MessageType.ERROR)),
      validateMessage: validateMessageMock,
      formatMessage: vi.fn().mockReturnValue(''),
      parseMessage: vi.fn().mockImplementation(
        (): ValidationResult<Message<TestMessages>> => ({
          success: true,
          data: createMockMessage('1', MessageType.RESPONSE),
        }),
      ),
    };

    testWallet = {
      address: '0xTEST',
      chainId: 1,
      publicKey: '0x',
    };

    connector = new TestConnector(mockTransport, mockProtocol);
  });

  describe('wallet management', () => {
    it('should connect successfully', async () => {
      await connector.connect(testWallet);
      expect(connector.isConnected()).toBe(true);
      expect(connector.getCurrentWalletInfo()?.address).toBe(testWallet.address);
    });

    it('should resume connection', async () => {
      const state: WalletState = {
        address: testWallet.address,
        networkId: testWallet.chainId,
        sessionId: 'test',
        lastActive: Date.now(),
      };

      await connector.resume(testWallet, state);
      expect(connector.isConnected()).toBe(true);
      expect(connector.getCurrentWalletInfo()?.address).toBe(testWallet.address);
      expect(connector.getCurrentWalletInfo()?.state).toEqual(state);
    });

    it('should handle disconnection', async () => {
      await connector.connect(testWallet);
      expect(connector.isConnected()).toBe(true);

      await connector.disconnect();
      expect(connector.isConnected()).toBe(false);
      expect(connector.getCurrentWalletInfo()).toBeNull();
    });

    it('should handle connection failures', async () => {
      vi.mocked(mockTransport.connect).mockRejectedValueOnce(
        new TransportError('Connection failed', TransportErrorCode.CONNECTION_FAILED),
      );

      await expect(connector.connect(testWallet)).rejects.toThrow(TransportError);
      expect(connector.isConnected()).toBe(false);
    });
  });

  describe('message handling', () => {
    beforeEach(async () => {
      await connector.connect(testWallet);
    });

    it('should send requests successfully', async () => {
      const result = await connector.testRequest('test', ['param1']);
      expect(mockTransport.send).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle transport errors', async () => {
      vi.mocked(mockTransport.send).mockRejectedValueOnce(
        new TransportError('Send failed', TransportErrorCode.SEND_FAILED),
      );

      await expect(connector.testRequest('test', [])).rejects.toThrow(TransportError);
    });

    it('should handle protocol validation errors', async () => {
      vi.mocked(mockProtocol.validateMessage).mockReturnValueOnce({
        success: false,
        error: new ProtocolError('Invalid message', ProtocolErrorCode.INVALID_FORMAT),
      });

      await expect(connector.testRequest('test', [])).rejects.toThrow(ProtocolError);
    });

    it('should validate connection state before sending', async () => {
      await connector.disconnect();
      await expect(connector.testRequest('test', [])).rejects.toThrow(TransportError);
    });

    it('should handle protocol messages', async () => {
      const message = {
        id: '1',
        type: MessageType.REQUEST,
        payload: {
          request: { method: 'test', params: [] },
          response: {},
        },
        timestamp: Date.now(),
      };

      await connector['handleProtocolMessage'](message);
      expect(connector.getMessages()).toContainEqual(message);
    });
  });

  describe('state management', () => {
    it('should track connection state', async () => {
      expect(connector.getState()).toBe(ConnectionStatus.DISCONNECTED);

      await connector.connect(testWallet);
      expect(connector.getState()).toBe(ConnectionStatus.CONNECTED);

      await connector.disconnect();
      expect(connector.getState()).toBe(ConnectionStatus.DISCONNECTED);
    });

    it('should prevent requests when disconnected', async () => {
      await expect(connector.testRequest('test', [])).rejects.toThrow(TransportError);
    });

    it('should maintain wallet state during connection', async () => {
      await connector.connect(testWallet);

      const wallet = connector.getCurrentWalletInfo();
      expect(wallet).toBeDefined();
      expect(wallet?.address).toBe(testWallet.address);
      expect(wallet?.chainId).toBe(testWallet.chainId);
      expect(wallet?.connected).toBe(true);
    });

    it('should cleanup state on disconnect', async () => {
      await connector.connect(testWallet);
      expect(connector.getCurrentWalletInfo()).toBeDefined();

      await connector.disconnect();
      expect(connector.getCurrentWalletInfo()).toBeNull();
      expect(connector.isConnected()).toBe(false);
    });
  });
});
