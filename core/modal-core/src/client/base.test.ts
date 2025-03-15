import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseConnector } from '../connector/base.js';
import {
  TransportError,
  TransportErrorCode,
  MessageType,
  type ValidationResult,
  ProtocolValidator,
} from '../transport/index.js';
import { ProtocolError, ProtocolErrorCode } from '../transport/errors.js';
import type { Protocol, Transport, Message } from '../transport/index.js';
import type {
  WalletInfo,
  WalletState,
  ConnectedWallet,
  ConnectorImplementationConfig,
} from '../types.js';

interface TestRequest {
  method: string;
  params: Record<string, unknown>;
}

interface TestResponse {
  result?: unknown;
  error?: string;
}

interface TestMessages {
  request: TestRequest;
  response: TestResponse;
}

const createMessage = <T>(
  type: MessageType,
  id: string,
  payload: T
): Message<T> => ({
  type,
  id,
  timestamp: Date.now(),
  payload,
});

// Create a concrete test implementation
class TestConnector extends BaseConnector<TestMessages> {
  override async getProvider(): Promise<unknown> {
    return {};
  }

  protected override handleProtocolMessage(_message: Message<TestMessages>): void {
    // Test implementation
  }

  override getType(): string {
    return this.type;
  }

  override getConnectedWallet(): ConnectedWallet | null {
    return this.currentWallet;
  }

  override isConnected(): boolean {
    return this.connected && this.transport.isConnected();
  }

  override async connect(walletInfo: WalletInfo): Promise<ConnectedWallet> {
    return super.connect(walletInfo);
  }

  override async resume(walletInfo: WalletInfo, state: WalletState): Promise<ConnectedWallet> {
    return super.resume(walletInfo, state);
  }

  override async disconnect(): Promise<void> {
    return super.disconnect();
  }

  override handleMessage(data: unknown): void {
    super.handleMessage(data);
  }

  public override sendRequest<P, R = unknown>(method: string, params: P): Promise<R> {
    return super.sendRequest(method, params);
  }
}

describe('BaseConnector', () => {
  const mockTransport = {
    connect: vi.fn(() => Promise.resolve()),
    disconnect: vi.fn(() => Promise.resolve()),
    send: vi.fn(),
    subscribe: vi.fn(),
    isConnected: vi.fn(() => true),
  } satisfies Transport;

  const mockValidator = new ProtocolValidator<TestMessages>();

  const mockProtocol: Protocol<TestMessages> = {
    validator: mockValidator,
    parseMessage: vi.fn((data: unknown): ValidationResult<Message<TestRequest>> => ({
      success: true,
      data: data as Message<TestRequest>,
    })),
    createRequest: vi.fn((method: string, params: unknown): Message<TestRequest> => {
      const request: TestRequest = {
        method,
        params: params as Record<string, unknown>
      };
      return createMessage(MessageType.REQUEST, 'test-id', request);
    }),
    validateMessage: vi.fn((message: unknown): ValidationResult<Message<TestMessages>> => ({
      success: true,
      data: message as Message<TestMessages>,
    })),
    formatMessage: vi.fn(),
    createResponse: vi.fn(),
    createError: vi.fn(),
  };

  const mockWalletInfo: WalletInfo = {
    id: 'test-wallet',
    name: 'Test Wallet',
    connector: {
      type: 'test',
    },
  };

  const mockConnectedWallet: ConnectedWallet = {
    info: mockWalletInfo,
    state: {
      address: '0x123',
      networkId: '1',
      sessionId: 'test-session',
    },
  };

  const mockConfig: ConnectorImplementationConfig = {
    transport: mockTransport,
    protocol: mockProtocol,
    type: 'test',
  };

  let connector: TestConnector;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockTransport.isConnected).mockReturnValue(true);
    connector = new TestConnector(mockConfig);
  });

  describe('initialization', () => {
    it('should initialize with correct config', () => {
      expect(connector.getType()).toBe('test');
      expect(connector.getConnectedWallet()).toBeNull();
    });
  });

  describe('request handling', () => {
    it('should handle transport disconnection', async () => {
      vi.mocked(mockTransport.isConnected).mockReturnValue(false);

      await expect(connector.sendRequest('test', { param: 'value' })).rejects.toThrow(
        new TransportError('Transport not connected', TransportErrorCode.TRANSPORT_ERROR),
      );
    });

    it('should handle protocol errors', async () => {
      vi.mocked(mockTransport.isConnected).mockReturnValue(true);

      const testRequest: TestRequest = {
        method: 'test',
        params: { param: 'value' }
      };

      const testMessage: Message<TestMessages> = createMessage(MessageType.ERROR, 'test-error-1', {
        request: testRequest,
        response: {
          error: 'Protocol error occurred'
        }
      });

      vi.mocked(mockProtocol.createRequest).mockReturnValueOnce(createMessage(MessageType.REQUEST, 'test-id', testRequest));
      vi.mocked(mockTransport.send).mockResolvedValueOnce(testMessage);
      vi.mocked(mockProtocol.validateMessage).mockReturnValueOnce({
        success: true,
        data: testMessage,
      });

      const promise = connector.sendRequest('test', { param: 'value' });
      
      await expect(promise).rejects.toHaveProperty('message', 'Protocol error response received');
      await expect(promise).rejects.toHaveProperty('code', ProtocolErrorCode.VALIDATION_FAILED);
    });
  });
});