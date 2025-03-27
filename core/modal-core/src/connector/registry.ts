import { ConnectionState, MessageType } from '../transport/types.js';
import type { Protocol, Transport, Message } from '../transport/types.js';
import type { BaseConnector } from './base.js';
import { MockConnector, type MockRequest } from './mock.js';
import type { ConnectorImplementationConfig, Provider, WalletInfo } from '../types.js';

export interface ConnectorConfig extends WalletInfo {
  type: string;
  [key: string]: unknown;
}

export type ConnectorCreator<TRequest> = new (
  transport: Transport,
  protocol: Protocol<TRequest>,
) => BaseConnector<TRequest>;

export class ConnectorRegistry {
  private connectors: Map<string, ConnectorImplementationConfig> = new Map();

  public register<TRequest>(
    type: string,
    config: ConnectorImplementationConfig,
    ctor: ConnectorCreator<TRequest>,
  ): void {
    if (this.connectors.has(type)) {
      throw new Error(`Connector type already registered: ${type}`);
    }

    const originalFactory = config.factory;
    this.connectors.set(type, {
      ...config,
      factory: async () => {
        const result = await originalFactory();
        const transport = this.createTransport(result);
        const connector = new ctor(transport, this.createProtocol<TRequest>(type));
        await connector.connect({
          address: 'unknown',
          chainId: 1,
          publicKey: 'unknown',
          ...config,
        });
        return result;
      },
    });
  }

  public unregister(type: string): void {
    this.connectors.delete(type);
  }

  public async create<TRequest>(type: string): Promise<BaseConnector<TRequest>> {
    const implementation = this.connectors.get(type);
    if (!implementation) {
      if (type === 'mock') {
        return this.createMockConnector() as unknown as BaseConnector<TRequest>;
      }
      throw new Error(`Connector type not registered: ${type}`);
    }

    const result = await implementation.factory();
    const transport = this.createTransport(result);
    return new MockConnector(
      transport,
      this.createProtocol<MockRequest>(type),
    ) as unknown as BaseConnector<TRequest>;
  }

  private createTransport(provider: Provider): Transport {
    return {
      connect: async () => provider.connect(),
      disconnect: async () => provider.disconnect(),
      send: async <T, R>(message: Message<T>): Promise<Message<R>> => {
        const result = await provider.request<R>(message.id, message.payload as unknown[]);
        return {
          id: message.id,
          type: MessageType.RESPONSE,
          payload: result,
          timestamp: Date.now(),
        };
      },
      isConnected: () => provider.isConnected(),
      getState: () => ConnectionState.CONNECTED,
      addErrorHandler: () => undefined,
      removeErrorHandler: () => undefined,
    };
  }

  private createMockConnector(): MockConnector {
    const transport = this.createTransport({
      connect: async () => undefined,
      disconnect: async () => undefined,
      request: async <T>(): Promise<T> => ({}) as T,
      isConnected: () => true,
    });

    return new MockConnector(transport, this.createProtocol<MockRequest>('mock'));
  }

  private createProtocol<TRequest>(type: string): Protocol<TRequest> {
    return {
      validate: () => ({
        success: true,
        data: {
          id: type,
          type: MessageType.REQUEST,
          payload: {} as TRequest,
          timestamp: Date.now(),
        },
      }),
      validateMessage: () => ({
        success: true,
        data: {
          id: type,
          type: MessageType.REQUEST,
          payload: {} as TRequest,
          timestamp: Date.now(),
        },
      }),
      parseMessage: () => ({
        success: true,
        data: {
          id: type,
          type: MessageType.REQUEST,
          payload: {} as TRequest,
          timestamp: Date.now(),
        },
      }),
      formatMessage: (message: Message<TRequest>) => message,
      createRequest: (method: string) => ({
        id: method,
        type: MessageType.REQUEST,
        payload: {} as TRequest,
        timestamp: Date.now(),
      }),
      createResponse: <TResponse>(id: string, result: TResponse) => ({
        id,
        type: MessageType.RESPONSE,
        payload: result,
        timestamp: Date.now(),
      }),
      createError: (id: string) => ({
        id,
        type: MessageType.ERROR,
        payload: {} as TRequest,
        timestamp: Date.now(),
      }),
    };
  }
}
