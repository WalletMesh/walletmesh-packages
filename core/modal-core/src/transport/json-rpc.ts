import { BaseTransport } from './base.js';
import { createTransportError } from './errors.js';
import { MessageType } from './types.js';
import type { Message } from './types.js';

/**
 * JSON-RPC transport message
 */
export interface JsonRpcMessage<T = unknown> {
  id: string;
  jsonrpc: '2.0';
  method?: string;
  params?: T[];
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/**
 * JSON-RPC request message
 */
export interface JsonRpcRequest<T = unknown> extends JsonRpcMessage<T> {
  method: string;
  params: T[];
}

/**
 * JSON-RPC response message
 */
export interface JsonRpcResponse<T = unknown> extends JsonRpcMessage<T> {
  result: T;
}

/**
 * Request payload type
 */
export interface JsonRpcRequestPayload {
  method: string;
  params?: unknown[];
}

/**
 * Error payload type
 */
export interface JsonRpcErrorPayload {
  message: string;
  code: number;
  data?: unknown;
}

/**
 * JSON-RPC error codes
 */
export enum JsonRpcErrorCode {
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  SERVER_ERROR = -32000,
  TIMEOUT = -32001,
}

/**
 * JSON-RPC transport base class
 */
export abstract class JsonRpcTransport extends BaseTransport {
  private pendingMessages: Map<
    string,
    {
      resolve: (value: Message<unknown>) => void;
      reject: (error: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  > = new Map();
  private readonly timeout: number;

  constructor(timeout = 5000) {
    super();
    this.timeout = timeout;
  }

  protected async connectImpl(): Promise<void> {
    // No-op - connection handled externally
  }

  protected async disconnectImpl(): Promise<void> {
    // Clean up pending messages
    for (const { reject, timer } of this.pendingMessages.values()) {
      clearTimeout(timer);
      reject(createTransportError.connectionFailed('Transport disconnected'));
    }
    this.pendingMessages.clear();
  }

  protected async sendImpl<T, R>(message: Message<T>): Promise<Message<R>> {
    if (!this.isConnected()) {
      throw createTransportError.notConnected('Transport not connected');
    }

    return new Promise<Message<R>>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingMessages.delete(message.id);
        const timeoutError = createTransportError.timeout('Message timeout');
        this.emitError(timeoutError);
        reject(timeoutError);
      }, this.timeout);

      this.pendingMessages.set(message.id, {
        resolve: (value: Message<unknown>) => resolve(value as Message<R>),
        reject,
        timer,
      });

      try {
        this.doSendMessage(message);
      } catch (error) {
        clearTimeout(timer);
        this.pendingMessages.delete(message.id);
        const transportError = createTransportError.sendFailed('Failed to send message', { cause: error });
        this.emitError(transportError);
        reject(transportError);
      }
    });
  }

  /**
   * Handle incoming JSON-RPC message
   */
  protected handleMessage(jsonRpcMessage: JsonRpcMessage): void {
    // Convert JSON-RPC message to internal message format
    const message = this.parseJsonRpcMessage(jsonRpcMessage);
    if (!message) return;

    // Handle pending messages
    const pending = this.pendingMessages.get(message.id);
    if (pending) {
      clearTimeout(pending.timer);
      this.pendingMessages.delete(message.id);
      if (message.type === MessageType.ERROR) {
        const payload = message.payload as JsonRpcErrorPayload;
        const transportError = createTransportError.error(payload.message, { cause: payload });
        this.emitError(transportError);
        pending.reject(transportError);
      } else {
        pending.resolve(message);
      }
    }
  }

  /**
   * Send message implementation
   */
  protected doSendMessage<T>(message: Message<T>): void {
    const jsonRpcMessage = this.createJsonRpcMessage(message);
    this.sendJsonRpcMessage(jsonRpcMessage);
  }

  /**
   * Create JSON-RPC message from internal message
   */
  protected createJsonRpcMessage<T>(message: Message<T>): JsonRpcMessage {
    const base = {
      jsonrpc: '2.0' as const,
      id: message.id,
    };

    if (message.type === MessageType.REQUEST) {
      const payload = message.payload as JsonRpcRequestPayload;
      return {
        ...base,
        method: payload.method,
        params: payload.params ?? [],
      };
    }

    if (message.type === MessageType.ERROR) {
      const payload = message.payload as JsonRpcErrorPayload;
      return {
        ...base,
        error: {
          code: payload.code ?? JsonRpcErrorCode.SERVER_ERROR,
          message: payload.message ?? 'Unknown error',
          data: payload.data,
        },
      };
    }

    return {
      ...base,
      result: message.payload,
    };
  }

  /**
   * Parse JSON-RPC message to internal message
   */
  protected parseJsonRpcMessage(jsonRpcMessage: JsonRpcMessage): Message | null {
    if (!this.validateJsonRpcMessage(jsonRpcMessage)) {
      const error = createTransportError.error('Invalid JSON-RPC message');
      this.emitError(error);
      return null;
    }

    if (jsonRpcMessage.error) {
      return {
        id: jsonRpcMessage.id,
        type: MessageType.ERROR,
        payload: {
          message: jsonRpcMessage.error.message,
          code: jsonRpcMessage.error.code,
          data: jsonRpcMessage.error.data,
        },
        timestamp: Date.now(),
      };
    }

    return {
      id: jsonRpcMessage.id,
      type: jsonRpcMessage.method ? MessageType.REQUEST : MessageType.RESPONSE,
      payload: jsonRpcMessage.method
        ? { method: jsonRpcMessage.method, params: jsonRpcMessage.params ?? [] }
        : jsonRpcMessage.result,
      timestamp: Date.now(),
    };
  }

  /**
   * Validate JSON-RPC message
   */
  protected validateJsonRpcMessage(message: JsonRpcMessage): boolean {
    return (
      typeof message === 'object' &&
      message !== null &&
      typeof message.id === 'string' &&
      message.jsonrpc === '2.0' &&
      ((typeof message.method === 'string' && Array.isArray(message.params)) ||
        message.result !== undefined ||
        (typeof message.error === 'object' &&
          message.error !== null &&
          typeof message.error.code === 'number' &&
          typeof message.error.message === 'string'))
    );
  }

  /**
   * Send JSON-RPC message
   */
  protected abstract sendJsonRpcMessage(message: JsonRpcMessage): void;
}
