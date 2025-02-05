import type {
  JSONRPCMethodMap,
  JSONRPCEventMap,
  JSONRPCContext,
  JSONRPCRequest,
  JSONRPCResponse,
  JSONRPCEvent,
  JSONRPCSerializer,
  JSONRPCMiddleware,
  JSONRPCID,
  JSONRPCParams,
  JSONRPCTransport,
} from './types.js';
import { EventManager } from './event-manager.js';
import { MiddlewareManager } from './middleware-manager.js';
import { MethodManager } from './method-manager.js';
import { JSONRPCError } from './error.js';
import { MessageValidator } from './message-validator.js';
import { ParameterSerializer } from './parameter-serializer.js';
import { RequestHandler } from './request-handler.js';
import { wrapHandler } from './utils.js';

export class JSONRPCNode<
  T extends JSONRPCMethodMap = JSONRPCMethodMap,
  E extends JSONRPCEventMap = JSONRPCEventMap,
  C extends JSONRPCContext = JSONRPCContext,
> {
  private methodManager: MethodManager<T, C>;
  private eventManager: EventManager<E>;
  private middlewareManager: MiddlewareManager<T, C>;
  private requestHandler: RequestHandler<T, C>;
  private messageValidator: MessageValidator;
  private parameterSerializer: ParameterSerializer;

  public setFallbackSerializer(serializer: JSONRPCSerializer<unknown, unknown>): void {
    this.parameterSerializer.setFallbackSerializer(serializer);
  }

  constructor(
    private transport: JSONRPCTransport,
    public readonly context: C = {} as C,
  ) {
    this.methodManager = new MethodManager<T, C>();
    this.eventManager = new EventManager<E>();
    this.messageValidator = new MessageValidator();
    this.parameterSerializer = new ParameterSerializer();
    this.requestHandler = new RequestHandler<T, C>(this.methodManager);

    this.middlewareManager = new MiddlewareManager<T, C>((context, request) =>
      this.requestHandler.handleRequest(context, request),
    );
  }

  public registerMethod<M extends keyof T>(
    name: Extract<M, string>,
    handler: (context: C, params: T[M]['params']) => Promise<T[M]['result']>,
  ): void {
    const wrappedHandler = wrapHandler<T, M, C>(handler);
    this.methodManager.registerMethod(name, wrappedHandler);
  }

  public registerSerializer<M extends keyof T>(
    method: M,
    serializer: JSONRPCSerializer<T[M]['params'], T[M]['result']>,
  ): void {
    this.methodManager.registerSerializer(method, serializer);
  }

  public async callMethod<M extends keyof T>(
    method: M,
    params?: T[M]['params'],
    timeoutInSeconds = 0,
  ): Promise<T[M]['result']> {
    const id = crypto.randomUUID();
    const serializer = this.methodManager.getSerializer(method);

    return new Promise((resolve, reject) => {
      this.methodManager.addPendingRequest(id, resolve, reject, timeoutInSeconds, serializer);

      const sendRequest = async () => {
        try {
          const serializedParams = await this.parameterSerializer.serializeParams(
            String(method),
            params,
            serializer,
          );
          const request: JSONRPCRequest<T, M> = {
            jsonrpc: '2.0',
            method,
            params: serializedParams as JSONRPCParams,
            id,
          };
          await this.transport.send(request);
        } catch (error) {
          reject(error);
          this.methodManager.rejectAllRequests(error instanceof Error ? error : new Error(String(error)));
        }
      };

      sendRequest();
    });
  }

  public async notify<M extends keyof T>(method: M, params: T[M]['params']): Promise<void> {
    const serializer = this.methodManager.getSerializer(method);
    const serializedParams = await this.parameterSerializer.serializeParams(
      String(method),
      params,
      serializer,
    );

    await this.transport.send({
      jsonrpc: '2.0',
      method,
      params: serializedParams as JSONRPCParams,
    });
  }

  public on<K extends keyof E>(event: K, handler: (params: E[K]) => void): () => void {
    return this.eventManager.on(event, handler);
  }

  public async emit<K extends keyof E>(event: K, params: E[K]): Promise<void> {
    const eventMessage: JSONRPCEvent<E, K> = {
      jsonrpc: '2.0',
      event,
      params,
    };
    await this.transport.send(eventMessage);
  }

  public addMiddleware(middleware: JSONRPCMiddleware<T, C>): () => void {
    return this.middlewareManager.addMiddleware(middleware);
  }

  public async receiveMessage(message: unknown): Promise<void> {
    if (typeof message === 'string') {
      console.error('Invalid message received:', message);
      await this.transport.send({
        jsonrpc: '2.0',
        error: {
          code: -32700,
          message: 'Parse error',
        },
        id: null,
      });
      return;
    }

    if (!this.messageValidator.isValidMessage(message)) {
      console.error('Invalid message received:', message);
      await this.transport.send({
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid Request',
        },
        id: null,
      });
      return;
    }

    const msg = message as { jsonrpc: '2.0'; method?: string; event?: string; id?: JSONRPCID };

    if (msg.method) {
      await this.handleRequest(message as JSONRPCRequest<T, keyof T>);
    } else if (msg.event) {
      this.handleEvent(message as JSONRPCEvent<E, keyof E>);
    } else if (msg.id !== undefined) {
      await this.handleResponse(message as JSONRPCResponse<T>);
    }
  }

  private async handleRequest(request: JSONRPCRequest<T, keyof T>): Promise<void> {
    try {
      const response = await this.middlewareManager.execute(this.context, request);

      if (request.id !== undefined) {
        await this.transport.send(response);
      }
    } catch (error) {
      if (request.id !== undefined) {
        const response: JSONRPCResponse<T> = {
          jsonrpc: '2.0',
          error:
            error instanceof JSONRPCError
              ? { code: error.code, message: error.message, data: error.data }
              : { code: -32000, message: error instanceof Error ? error.message : 'Unknown error' },
          id: request.id,
        };
        await this.transport.send(response);
      }
    }
  }

  private async handleResponse(response: JSONRPCResponse<T>): Promise<void> {
    await this.methodManager.handleResponse(response.id, response.result, response.error);
  }

  private handleEvent(event: JSONRPCEvent<E, keyof E>): void {
    this.eventManager.handleEvent(event.event, event.params);
  }

  public setFallbackHandler(
    handler: (context: C, method: string, params: JSONRPCParams) => Promise<unknown>,
  ): void {
    this.methodManager.setFallbackHandler(wrapHandler(handler));
  }

  public async close(): Promise<void> {
    this.eventManager.removeAllHandlers();
    this.middlewareManager.removeAllMiddleware();
    this.methodManager.rejectAllRequests(new Error('Node closed'));
  }
}
