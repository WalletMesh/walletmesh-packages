/**
 * @module aztec-rpc-wallet/wallet/create-node
 *
 * Factory module for creating Aztec wallet nodes that integrate with the WalletRouter system.
 * This module provides the wallet-side implementation for handling Aztec JSON-RPC requests.
 */

import { type JSONRPCEventMap, JSONRPCNode, type JSONRPCTransport } from '@walletmesh/jsonrpc';
import type { AztecWalletEventMap, AztecWalletMethodMap } from '../types.js';
import { registerAztecWalletHandlers } from './handlers.js';
import { registerAztecWalletSerializers } from './register-serializers.js';
import type { AztecWalletHandlerContext } from './types.js';
import type { AztecServerWallet } from './wallet.js';

/**
 * Creates and configures a {@link JSONRPCNode} to serve as an Aztec wallet endpoint.
 * This node is intended to be used on the wallet-side (e.g., in a browser extension
 * or a backend service managing user accounts) and can be connected to a
 * {@link WalletRouter} instance.
 *
 * The created node is equipped with:
 * - Handlers for all Aztec RPC methods defined in {@link AztecWalletMethodMap}.
 * - Serializers for Aztec-specific data types, ensuring correct data exchange
 *   over JSON-RPC.
 * - A context ({@link AztecWalletHandlerContext}) providing handlers with access to a
 *   {@link Wallet}
 *
 * @param wallet - An instance of {@link Wallet} from `aztec.js`, representing
 *                 the user's Aztec account and signing capabilities.
 * @param transport - A {@link JSONRPCTransport} instance that the node will use for
 *                    sending and receiving JSON-RPC messages. This transport typically
 *                    connects to a corresponding transport on the client/dApp side,
 *                    often via the {@link WalletRouter}.
 * @returns A fully configured {@link JSONRPCNode} instance, typed with
 *          {@link AztecWalletMethodMap} and {@link AztecWalletHandlerContext}, ready to
 *          process Aztec wallet requests.
 *
 * @example
 * ```typescript
 * import { createAztecWalletNode } from '@walletmesh/aztec-rpc-wallet/server';
 * import { WalletRouter, createLocalTransportPair } from '@walletmesh/router';
 * import type { Wallet } from '@aztec/aztec.js/wallet';
 * import { MyWallet, MyRouterTransport, MyPermissionManager } from './my-setup'; // User's setup
 *
 * // 1. Initialize Aztec Wallet
 * const wallet: Wallet = new MyWallet();
 *
 * // 2. Create a local transport pair for communication between router and wallet node
 * const [routerSideTransport, walletNodeSideTransport] = createLocalTransportPair();
 *
 * // 3. Create the Aztec Wallet Node
 * const aztecNode = createAztecWalletNode(wallet, walletNodeSideTransport);
 * // aztecNode will start listening for requests on walletNodeSideTransport
 *
 * // 4. Create and configure the WalletRouter
 * const routerTransport = new MyRouterTransport(); // Transport for dApp to router communication
 * const permissionManager = new MyPermissionManager();
 * const router = new WalletRouter(
 *   routerTransport,
 *   new Map([['aztec:testnet', routerSideTransport]]), // Route 'aztec:testnet' to our node
 *   permissionManager
 * );
 *
 * // The system is now set up. DApps can connect to 'routerTransport'
 * // and send requests to 'aztec:testnet', which will be handled by 'aztecNode'.
 * ```
 * @see {@link JSONRPCNode}
 * @see {@link AztecWalletMethodMap}
 * @see {@link AztecWalletHandlerContext}
 * @see {@link createAztecHandlers}
 * @see {@link registerAztecWalletSerializers} (wallet-side version)
 */
export function createAztecWalletNode({
  transport,
  wallet,
}: {
  transport: JSONRPCTransport;
  wallet: AztecServerWallet;
}): JSONRPCNode<AztecWalletMethodMap, JSONRPCEventMap, AztecWalletHandlerContext> {
  // Create the handler context that will be passed to all method handlers
  // This context provides access to the wallet instance
  const context: AztecWalletHandlerContext = {
    wallet,
    notify: async () => {
      throw new Error('Aztec wallet node is not ready to emit notifications yet');
    },
  };

  // Create the JSON-RPC node with typed method map and handler context
  const jsonRpcNode = new JSONRPCNode<AztecWalletMethodMap, AztecWalletEventMap, AztecWalletHandlerContext>(
    transport,
    context,
  );

  // Expose the node's notify helper through the handler context so individual handlers
  // can emit lifecycle events (e.g., transaction status updates) without direct access to the node.
  context.notify = async (method, params) => {
    await jsonRpcNode.notify(method, params);
  };

  registerAztecWalletHandlers(jsonRpcNode);
  registerAztecWalletSerializers(jsonRpcNode);

  // Return the configured node
  return jsonRpcNode;
}
