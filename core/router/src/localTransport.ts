import type {
  JSONRPCTransport,
  JSONRPCNode,
  JSONRPCMethodMap,
  JSONRPCEventMap,
  JSONRPCContext,
} from '@walletmesh/jsonrpc';

/**
 * Configuration options for LocalTransport
 *
 * @example
 * ```typescript
 * // Default behavior - errors are logged as warnings
 * const transport = new LocalTransport();
 *
 * // Throw errors instead of logging
 * const strictTransport = new LocalTransport({ throwOnError: true });
 * ```
 *
 * @public
 */
export interface LocalTransportOptions {
  /**
   * Whether to throw errors instead of logging warnings.
   * When true, errors in message handling will be thrown.
   * When false (default), errors will be logged as warnings.
   *
   * Use cases:
   * - Set to `true` in test environments for immediate error feedback
   * - Set to `true` when you need strict error handling and want failures to propagate
   * - Leave as `false` (default) in production for resilient operation where
   *   transient errors shouldn't crash the transport
   *
   * @defaultValue false
   */
  throwOnError?: boolean;
}

/**
 * A local transport that directly connects two JSONRPCNodes without network overhead.
 * This transport calls receiveMessage directly on the connected nodes, maintaining
 * proper serialization and protocol handling while avoiding actual transport costs.
 *
 * This is particularly useful for connecting a WalletRouter to a local wallet
 * implementation, ensuring proper message serialization without the overhead
 * of a real transport.
 *
 * @example
 * ```typescript
 * // Create a bidirectional local transport pair
 * const [clientTransport, serverTransport] = createLocalTransportPair();
 *
 * // Create server with wallet implementation
 * const server = new JSONRPCNode(serverTransport, walletContext);
 * server.registerMethod('eth_accounts', async () => ['0x...']);
 *
 * // Use client transport directly with router
 * const router = new WalletRouter(transport, new Map([
 *   ['eip155:1', clientTransport]
 * ]), permissionManager);
 * ```
 *
 * @public
 */
export class LocalTransport implements JSONRPCTransport {
  private remoteNode: JSONRPCNode<JSONRPCMethodMap, JSONRPCEventMap, JSONRPCContext> | null = null;
  private messageHandler: ((message: unknown) => void) | null = null;
  private options: LocalTransportOptions;

  /**
   * Creates an instance of LocalTransport.
   * @param options - Configuration options for the transport
   */
  constructor(options: LocalTransportOptions = {}) {
    this.options = {
      throwOnError: false,
      ...options,
    };
  }

  /**
   * Connect this transport to a remote JSONRPCNode
   */
  connectTo(remoteNode: JSONRPCNode<JSONRPCMethodMap, JSONRPCEventMap, JSONRPCContext>): void {
    this.remoteNode = remoteNode;
  }

  /**
   * Send a message to the connected remote node
   */
  async send(message: unknown): Promise<void> {
    if (!this.remoteNode) {
      throw new Error('LocalTransport: No remote node connected');
    }

    // Simulate async transport by using setTimeout (browser-compatible)
    await new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        try {
          if (this.remoteNode) {
            this.remoteNode.receiveMessage(message);
          }
          resolve();
        } catch (error) {
          if (this.options.throwOnError) {
            reject(error);
          } else {
            console.warn('LocalTransport: Error in receiveMessage:', error);
            resolve(); // Still resolve to prevent hanging
          }
        }
      }, 0);
    });
  }

  /**
   * Register a message handler for incoming messages
   */
  onMessage(handler: (message: unknown) => void): void {
    this.messageHandler = handler;
  }

  /**
   * Receive a message and pass it to the registered handler
   */
  receive(message: unknown): void {
    if (this.messageHandler) {
      // Simulate async transport (browser-compatible)
      setTimeout(() => {
        try {
          if (this.messageHandler) {
            this.messageHandler(message);
          }
        } catch (error) {
          if (this.options.throwOnError) {
            // Schedule the error to be thrown in the next tick
            // This ensures it can be caught by error handlers while maintaining async behavior
            setTimeout(() => {
              throw error;
            }, 0);
          } else {
            console.warn('LocalTransport: Error in message handler:', error);
          }
        }
      }, 0);
    }
  }
}

/**
 * Create a pair of connected local transports for bidirectional communication.
 * This is the recommended way to connect a local wallet implementation to a router.
 *
 * @param options - Configuration options for both transports
 * @returns A tuple of [clientTransport, serverTransport] that are connected to each other
 *
 * @example
 * ```typescript
 * // Create transports with default options (errors logged)
 * const [clientTransport, serverTransport] = createLocalTransportPair();
 *
 * // Create transports that throw errors instead of logging
 * const [strictClient, strictServer] = createLocalTransportPair({ throwOnError: true });
 *
 * // Server side (wallet implementation)
 * const walletNode = new JSONRPCNode(serverTransport, context);
 * walletNode.registerMethod('eth_accounts', accountsHandler);
 *
 * // Client side (pass transport directly to router)
 * const router = new WalletRouter(routerTransport, new Map([
 *   ['eip155:1', clientTransport]
 * ]), permissionManager);
 * ```
 *
 * @public
 */
export function createLocalTransportPair(options?: LocalTransportOptions): [LocalTransport, LocalTransport] {
  const transport1 = new LocalTransport(options);
  const transport2 = new LocalTransport(options);

  // Override send methods to route to each other's receive
  transport1.send = async (message: unknown) => {
    // Simulate async transport by using setTimeout
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        transport2.receive(message);
        resolve();
      }, 0);
    });
  };

  transport2.send = async (message: unknown) => {
    // Simulate async transport by using setTimeout
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        transport1.receive(message);
        resolve();
      }, 0);
    });
  };

  return [transport1, transport2];
}

/**
 * Create a local transport that connects to an existing JSONRPCNode.
 * This is useful when you already have a node instance and want to
 * create a transport that sends messages to it.
 *
 * @param remoteNode The JSONRPCNode to connect to
 * @param options - Configuration options for the transport
 * @returns A transport that sends messages to the remote node
 *
 * @example
 * ```typescript
 * const existingNode = new JSONRPCNode(...);
 * const transport = createLocalTransport(existingNode);
 * const newNode = new JSONRPCNode(transport, context);
 * ```
 *
 * @public
 */
export function createLocalTransport(
  remoteNode: JSONRPCNode<JSONRPCMethodMap, JSONRPCEventMap, JSONRPCContext>,
  options?: LocalTransportOptions,
): LocalTransport {
  const transport = new LocalTransport(options);
  transport.connectTo(remoteNode);
  return transport;
}
