[**@walletmesh/aztec-rpc-wallet v0.5.0**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / createAztecWalletNode

# Function: createAztecWalletNode()

> **createAztecWalletNode**(`wallet`, `pxe`, `transport`): `JSONRPCNode`\<[`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md), [`JSONRPCEventMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/interfaces/JSONRPCEventMap.md), [`AztecHandlerContext`](../interfaces/AztecHandlerContext.md)\>

Defined in: [aztec/rpc-wallet/src/wallet/create-node.ts:76](https://github.com/WalletMesh/walletmesh-packages/blob/fd734440d9c5e6ff3c77f868722c74b1be65d39d/aztec/rpc-wallet/src/wallet/create-node.ts#L76)

Creates and configures a JSONRPCNode to serve as an Aztec wallet endpoint.
This node is intended to be used on the wallet-side (e.g., in a browser extension
or a backend service managing user accounts) and can be connected to a
WalletRouter instance.

The created node is equipped with:
- Handlers for all Aztec RPC methods defined in [AztecWalletMethodMap](../interfaces/AztecWalletMethodMap.md).
- Serializers for Aztec-specific data types, ensuring correct data exchange
  over JSON-RPC.
- A context ([AztecHandlerContext](../interfaces/AztecHandlerContext.md)) providing handlers with access to the
  necessary AccountWallet, PXE client, and a [ContractArtifactCache](../classes/ContractArtifactCache.md).

## Parameters

### wallet

`AccountWallet`

An instance of AccountWallet from `aztec.js`, representing
                the user's Aztec account and signing capabilities.

### pxe

`PXE`

An instance of PXE (Private Execution Environment) client from
             `aztec.js`, used for interacting with the Aztec network (e.g., simulating
             transactions, getting node info).

### transport

[`JSONRPCTransport`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/interfaces/JSONRPCTransport.md)

A [JSONRPCTransport](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/interfaces/JSONRPCTransport.md) instance that the node will use for
                   sending and receiving JSON-RPC messages. This transport typically
                   connects to a corresponding transport on the client/dApp side,
                   often via the WalletRouter.

## Returns

`JSONRPCNode`\<[`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md), [`JSONRPCEventMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/interfaces/JSONRPCEventMap.md), [`AztecHandlerContext`](../interfaces/AztecHandlerContext.md)\>

A fully configured JSONRPCNode instance, typed with
         [AztecWalletMethodMap](../interfaces/AztecWalletMethodMap.md) and [AztecHandlerContext](../interfaces/AztecHandlerContext.md), ready to
         process Aztec wallet requests.

## Example

```typescript
import { createAztecWalletNode } from '@walletmesh/aztec-rpc-wallet';
import { WalletRouter, createLocalTransportPair } from '@walletmesh/router';
import { MyAccountWallet, MyPXE, MyRouterTransport, MyPermissionManager } from './my-setup'; // User's setup

// 1. Initialize Aztec AccountWallet and PXE
const accountWallet = new MyAccountWallet();
const pxe = new MyPXE();

// 2. Create a local transport pair for communication between router and wallet node
const [routerSideTransport, walletNodeSideTransport] = createLocalTransportPair();

// 3. Create the Aztec Wallet Node
const aztecNode = createAztecWalletNode(accountWallet, pxe, walletNodeSideTransport);
// aztecNode will start listening for requests on walletNodeSideTransport

// 4. Create and configure the WalletRouter
const routerTransport = new MyRouterTransport(); // Transport for dApp to router communication
const permissionManager = new MyPermissionManager();
const router = new WalletRouter(
  routerTransport,
  new Map([['aztec:testnet', routerSideTransport]]), // Route 'aztec:testnet' to our node
  permissionManager
);

// The system is now set up. DApps can connect to 'routerTransport'
// and send requests to 'aztec:testnet', which will be handled by 'aztecNode'.
```

## See

 - JSONRPCNode
 - [AztecWalletMethodMap](../interfaces/AztecWalletMethodMap.md)
 - [AztecHandlerContext](../interfaces/AztecHandlerContext.md)
 - createAztecHandlers
 - [registerAztecSerializers](registerWalletAztecSerializers.md) (wallet-side version)
