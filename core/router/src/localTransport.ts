import type {
  JSONRPCTransport,
  JSONRPCNode,
  JSONRPCMethodMap,
  JSONRPCEventMap,
  JSONRPCContext,
} from '@walletmesh/jsonrpc';

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
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        this.remoteNode?.receiveMessage(message);
        resolve();
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
        this.messageHandler?.(message);
      }, 0);
    }
  }
}

/**
 * Create a pair of connected local transports for bidirectional communication.
 * This is the recommended way to connect a local wallet implementation to a router.
 *
 * @returns A tuple of [clientTransport, serverTransport] that are connected to each other
 *
 * @example
 * ```typescript
 * const [clientTransport, serverTransport] = createLocalTransportPair();
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
export function createLocalTransportPair(): [LocalTransport, LocalTransport] {
  const transport1 = new LocalTransport();
  const transport2 = new LocalTransport();

  // Cross-connect the transports
  // When transport1 sends, transport2 receives
  transport1.send = async (message: unknown) => {
    transport2.receive(message);
  };

  // When transport2 sends, transport1 receives
  transport2.send = async (message: unknown) => {
    transport1.receive(message);
  };

  return [transport1, transport2];
}

/**
 * Create a local transport that connects to an existing JSONRPCNode.
 * This is useful when you already have a node instance and want to
 * create a transport that sends messages to it.
 *
 * @param remoteNode The JSONRPCNode to connect to
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
): LocalTransport {
  const transport = new LocalTransport();
  transport.connectTo(remoteNode);
  return transport;
}
