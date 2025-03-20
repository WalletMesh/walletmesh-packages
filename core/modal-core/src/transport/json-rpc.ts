import { EventEmitter } from 'node:events';
import { v4 as uuid } from 'uuid';
import { BaseTransport } from './base.js';
import type { Message } from './types.js';
import { TransportErrorCode } from './errors.js';

interface JsonRpcRequestMessage {
  jsonrpc: '2.0';
  id?: string;
  method: string;
  params?: unknown;
}

interface JsonRpcResponseMessage {
  jsonrpc: '2.0';
  id: string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export type JsonRpcMessage = JsonRpcRequestMessage | JsonRpcResponseMessage;
export type JsonRpcRequest = JsonRpcRequestMessage;
export type JsonRpcSendFn = (message: JsonRpcMessage) => Promise<void>;

export interface JsonRpcTransportOptions {
  timeout?: number;
  debug?: boolean;
  retries?: number;
}

const DEFAULT_OPTIONS = {
  timeout: 30000,
  debug: false,
  retries: 3
};

export class JsonRpcTransport extends BaseTransport {
  private connected = false;
  private readonly emitter = new EventEmitter();
  private readonly options: Required<JsonRpcTransportOptions>;
  private readonly sendFn: JsonRpcSendFn;

  constructor(
    sendRpc: JsonRpcSendFn,
    options: JsonRpcTransportOptions = {}
  ) {
    super();
    this.sendFn = sendRpc;
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options
    };
  }

  protected async connectImpl(): Promise<void> {
    try {
      await this.sendFn({ jsonrpc: '2.0', method: 'connect' });
      this.connected = true;
    } catch (error) {
      const transportError = this.createError(
        'Failed to connect',
        TransportErrorCode.CONNECTION_FAILED,
        error
      );
      this.notifyError(transportError);
      throw transportError;
    }
  }

  protected async doDisconnect(): Promise<void> {
    try {
      await this.sendFn({ jsonrpc: '2.0', method: 'disconnect' });
    } catch (error) {
      // Ignore disconnection errors
    } finally {
      this.connected = false;
      this.emitter.removeAllListeners();
    }
  }

  protected async sendImpl<T = unknown, R = unknown>(message: Message<T>): Promise<Message<R>> {
    return new Promise<Message<R>>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.emitter.removeAllListeners(message.id);
        const error = this.createError(
          'Message timeout',
          TransportErrorCode.TIMEOUT
        );
        this.notifyError(error);
        reject(error);
      }, this.options.timeout);

      this.emitter.once(message.id, (response: JsonRpcResponseMessage) => {
        clearTimeout(timeoutId);
        if (response.error) {
          const error = this.createError(
            response.error.message,
            TransportErrorCode.INVALID_MESSAGE,
            response.error
          );
          this.notifyError(error);
          reject(error);
        } else {
          resolve(response.result as unknown as Message<R>);
        }
      });

      const rpcMessage: JsonRpcRequestMessage = {
        jsonrpc: '2.0',
        id: message.id || uuid(),
        method: message.type,
        params: message.payload
      };

      this.sendFn(rpcMessage).catch((error) => {
        clearTimeout(timeoutId);
        this.emitter.removeAllListeners(message.id);
        const transportError = this.createError(
          'Failed to send message',
          TransportErrorCode.CONNECTION_FAILED,
          error
        );
        this.notifyError(transportError);
        reject(transportError);
      });
    });
  }

  public override isConnected(): boolean {
    return this.connected;
  }

  public handleMessage(message: JsonRpcMessage): void {
    const id = 'id' in message && message.id;
    if (!id) {
      return;
    }
    this.emitter.emit(id, message);
  }
}
