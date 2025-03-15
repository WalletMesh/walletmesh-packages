/**
 * @packageDocumentation
 * JSON-RPC protocol implementation
 */

import { 
  type Protocol,
  type Message,
  type ProtocolPayload,
  MessageType,
  TransportError,
  TransportErrorCode,
} from './types.js';
import { 
  type ValidationResult,
  ProtocolValidator 
} from './protocol-validator.js';
import { 
  ProtocolError,
  ProtocolErrorCode,
} from './errors.js';

/**
 * JSON-RPC error object
 */
export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

/**
 * JSON-RPC method call
 */
export interface JsonRpcMethodCall {
  method: string;
  jsonrpc: string;
  params?: unknown[];
  id?: string | number | null;
}

/**
 * JSON-RPC response result
 */
export interface JsonRpcResult {
  jsonrpc: string;
  id: string | number | null;
  result?: unknown;
  error?: JsonRpcError;
}

/**
 * JSON-RPC protocol messages
 */
export interface JsonRpcPayload extends ProtocolPayload {
  request: JsonRpcMethodCall;
  response: JsonRpcResult;
}

/**
 * JSON-RPC protocol implementation
 */
export class JsonRpcProtocol implements Protocol<JsonRpcPayload> {
  validator: ProtocolValidator<JsonRpcPayload>;

  constructor() {
    this.validator = new ProtocolValidator<JsonRpcPayload>();
  }

  /**
   * Validates a message
   */
  validateMessage(message: unknown): ValidationResult<Message<JsonRpcPayload>> {
    if (!message || typeof message !== 'object') {
      return { success: false, error: new ProtocolError('Invalid message format', ProtocolErrorCode.INVALID_FORMAT) };
    }

    const msg = message as Message<JsonRpcPayload['request'] | JsonRpcPayload['response']>;
    
    if (!msg.type || !msg.id || !msg.payload) {
      return { success: false, error: new ProtocolError('Required fields missing', ProtocolErrorCode.INVALID_FORMAT) };
    }

    if (typeof msg.timestamp !== 'number') {
      return { success: false, error: new ProtocolError('Invalid timestamp', ProtocolErrorCode.INVALID_FORMAT) };
    }

    try {
      switch (msg.type) {
        case MessageType.REQUEST:
        {
          if (!this.isValidRequest(msg.payload)) {
            return { success: false, error: new ProtocolError('Invalid request format', ProtocolErrorCode.INVALID_FORMAT) };
          }
          break;
        }

        case MessageType.RESPONSE:
        case MessageType.ERROR:
        {
          break;
        }

        default:
          return { success: false, error: new ProtocolError('Unknown message type', ProtocolErrorCode.INVALID_FORMAT) };
      }

      return {
        success: true,
        data: msg as unknown as Message<JsonRpcPayload>,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof ProtocolError ? error : new ProtocolError('Validation failed', ProtocolErrorCode.VALIDATION_FAILED),
      };
    }
  }

  /**
   * Parses raw data into JSON-RPC message
   */
  parseMessage(data: unknown): ValidationResult<Message<JsonRpcPayload['request']>> {
    try {
      if (!data || typeof data !== 'object') {
        throw new TransportError('Invalid message format', TransportErrorCode.INVALID_MESSAGE);
      }

      const parsed = typeof data === 'string' ? JSON.parse(data) : data;

      if (!parsed || typeof parsed !== 'object') {
        throw new TransportError('Invalid message format', TransportErrorCode.INVALID_MESSAGE);
      }

      const msg = parsed as Record<string, unknown>;

      // Return error for non-request messages
      if ('result' in msg || 'error' in msg) {
        throw new TransportError('Invalid JSON-RPC message', TransportErrorCode.INVALID_MESSAGE);
      }

      // Validate protocol version and required fields
      if (msg['jsonrpc'] !== '2.0' || typeof msg['method'] !== 'string') {
        throw new TransportError('Invalid JSON-RPC message', TransportErrorCode.INVALID_MESSAGE);
      }

      const message: Message<JsonRpcMethodCall> = {
        id: String(msg['id'] ?? Date.now()),
        type: MessageType.REQUEST,
        timestamp: Date.now(),
        payload: {
          method: msg['method'] as string,
          params: Array.isArray(msg['params']) ? msg['params'] : [],
          jsonrpc: '2.0',
        },
      };

      return {
        success: true,
        data: message,
      };

    } catch (error) {
      throw error instanceof TransportError 
        ? error 
        : new TransportError('Failed to parse message', TransportErrorCode.INVALID_MESSAGE);
    }
  }

  /**
   * Formats message for transport
   */
  formatMessage(message: Message<JsonRpcPayload['request'] | JsonRpcPayload['response']>): string {
    if (!message.type || !message.payload) {
      throw new TransportError('Invalid message format', TransportErrorCode.INVALID_MESSAGE);
    }

    let formatted: Record<string, unknown>;

    switch (message.type) {
      case MessageType.REQUEST: {
        const req = message.payload as JsonRpcMethodCall;
        formatted = {
          jsonrpc: '2.0',
          method: req.method,
          params: req.params,
          id: message.id,
        };
        break;
      }

      case MessageType.RESPONSE: {
        const res = message.payload as JsonRpcResult;
        formatted = {
          jsonrpc: '2.0',
          id: message.id,
          result: res.result,
        };
        break;
      }

      case MessageType.ERROR: {
        const err = message.payload as JsonRpcMethodCall;
        formatted = {
          jsonrpc: '2.0',
          id: message.id,
          error: err.params?.[0],
        };
        break;
      }

      default:
        throw new TransportError('Unsupported message type', TransportErrorCode.INVALID_MESSAGE);
    }

    return JSON.stringify(formatted);
  }

  /**
   * Creates a request message
   */
  createRequest<M extends string>(method: M, params: unknown): Message<JsonRpcMethodCall> {
    return {
      id: String(Date.now()),
      type: MessageType.REQUEST,
      timestamp: Date.now(),
      payload: {
        method,
        params: params === null ? [] : (Array.isArray(params) ? params : [params]),
        jsonrpc: '2.0',
      },
    };
  }

  /**
   * Creates a response message
   */
  createResponse(id: string, result: unknown): Message<JsonRpcResult> {
    return {
      id,
      type: MessageType.RESPONSE,
      timestamp: Date.now(),
      payload: {
        jsonrpc: '2.0',
        id,
        result,
      },
    };
  }

  /**
   * Creates an error message
   */
  createError(requestId: string, error: Error): Message<JsonRpcMethodCall> {
    const errorResponse: JsonRpcError = {
      code: -32603,
      message: error.message,
      data: {
        name: error.name,
        stack: error.stack,
      },
    };

    return {
      id: requestId,
      type: MessageType.ERROR,
      timestamp: Date.now(),
      payload: {
        method: 'error',
        params: [errorResponse],
        jsonrpc: '2.0',
      },
    };
  }

  private isValidRequest(request: unknown): request is JsonRpcMethodCall {
    if (!request || typeof request !== 'object') {
      return false;
    }

    const req = request as JsonRpcMethodCall;
    return typeof req.method === 'string' &&
           (!req.params || Array.isArray(req.params));
  }

  private isValidResponse(response: unknown): response is JsonRpcResult {
    if (!response || typeof response !== 'object') {
      return false;
    }

    const res = response as JsonRpcResult;

    const validId = typeof res.id === 'string' ||
                   typeof res.id === 'number' ||
                   res.id === null;

    const validError = !res.error || (
      typeof res.error === 'object' &&
      typeof res.error.code === 'number' &&
      typeof res.error.message === 'string'
    );

    return validId && (res.result !== undefined || validError);
  }
}
