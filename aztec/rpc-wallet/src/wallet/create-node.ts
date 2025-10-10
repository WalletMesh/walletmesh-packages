/**
 * @module aztec-rpc-wallet/wallet/create-node
 *
 * Factory module for creating Aztec wallet nodes that integrate with the WalletRouter system.
 * This module provides the wallet-side implementation for handling Aztec JSON-RPC requests.
 */

import type { AccountWallet, PXE } from '@aztec/aztec.js';
import { type JSONRPCEventMap, JSONRPCNode, type JSONRPCTransport } from '@walletmesh/jsonrpc';
import { ContractArtifactCache } from '../contractArtifactCache.js';
import type { AztecWalletMethodMap } from '../types.js';
import { type AztecHandlerContext, createAztecHandlers } from './handlers/index.js';
import { registerAztecSerializers } from './serializers.js';

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
 * - A context ({@link AztecHandlerContext}) providing handlers with access to the
 *   necessary {@link AccountWallet}, {@link PXE} client, and a {@link ContractArtifactCache}.
 *
 * @param wallet - An instance of {@link AccountWallet} from `aztec.js`, representing
 *                 the user's Aztec account and signing capabilities.
 * @param pxe - An instance of {@link PXE} (Private Execution Environment) client from
 *              `aztec.js`, used for interacting with the Aztec network (e.g., simulating
 *              transactions, getting node info).
 * @param transport - A {@link JSONRPCTransport} instance that the node will use for
 *                    sending and receiving JSON-RPC messages. This transport typically
 *                    connects to a corresponding transport on the client/dApp side,
 *                    often via the {@link WalletRouter}.
 * @returns A fully configured {@link JSONRPCNode} instance, typed with
 *          {@link AztecWalletMethodMap} and {@link AztecHandlerContext}, ready to
 *          process Aztec wallet requests.
 *
 * @example
 * ```typescript
 * import { createAztecWalletNode } from '@walletmesh/aztec-rpc-wallet';
 * import { WalletRouter, createLocalTransportPair } from '@walletmesh/router';
 * import { MyAccountWallet, MyPXE, MyRouterTransport, MyPermissionManager } from './my-setup'; // User's setup
 *
 * // 1. Initialize Aztec AccountWallet and PXE
 * const accountWallet = new MyAccountWallet();
 * const pxe = new MyPXE();
 *
 * // 2. Create a local transport pair for communication between router and wallet node
 * const [routerSideTransport, walletNodeSideTransport] = createLocalTransportPair();
 *
 * // 3. Create the Aztec Wallet Node
 * const aztecNode = createAztecWalletNode(accountWallet, pxe, walletNodeSideTransport);
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
 * @see {@link AztecHandlerContext}
 * @see {@link createAztecHandlers}
 * @see {@link registerAztecSerializers} (wallet-side version)
 */
export function createAztecWalletNode(
  wallet: AccountWallet,
  pxe: PXE,
  transport: JSONRPCTransport,
): JSONRPCNode<AztecWalletMethodMap, JSONRPCEventMap, AztecHandlerContext> {
  // Initialize the contract artifact cache for this wallet
  const cache = new ContractArtifactCache(wallet);

  // Create the handler context that will be passed to all method handlers
  // This context provides access to the wallet, PXE, and cache instances
  const context: AztecHandlerContext = {
    wallet,
    pxe,
    cache,
    notify: async () => {
      throw new Error('Aztec wallet node is not ready to emit notifications yet');
    },
  };

  // Create the JSON-RPC node with typed method map and handler context
  const node = new JSONRPCNode<AztecWalletMethodMap, JSONRPCEventMap, AztecHandlerContext>(
    transport,
    context,
  );

  // Expose the node's notify helper through the handler context so individual handlers
  // can emit lifecycle events (e.g., proving status updates) without direct access to the node.
  context.notify = async (method, params) => {
    await node.notify(method, params);
  };

  // Register all Aztec method handlers
  // The createAztecHandlers function returns a map of all available Aztec methods
  const handlers = createAztecHandlers();
  for (const [methodStr, handlerFunc] of Object.entries(handlers)) {
    const typedMethodKey = methodStr as keyof AztecWalletMethodMap;
    // Cast the handler to the specific type expected by registerMethod
    // This relies on createAztecHandlers() providing correctly typed handlers
    // for each method string.
    // methodStr is already a string, which is expected by the first param of registerMethod.
    // typedMethodKey is used for strong typing of params and result.
    node.registerMethod(
      methodStr, // Use the string key here
      handlerFunc as (
        context: AztecHandlerContext,
        params: AztecWalletMethodMap[typeof typedMethodKey]['params'],
      ) => Promise<AztecWalletMethodMap[typeof typedMethodKey]['result']>,
    );
  }

  // Register serializers for all Aztec types
  // This enables proper serialization/deserialization of Aztec objects over JSON-RPC
  registerAztecSerializers(node);

  // Return the configured node
  return node;
}
