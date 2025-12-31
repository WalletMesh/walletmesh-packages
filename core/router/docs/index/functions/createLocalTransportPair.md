[**@walletmesh/router v0.5.4**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / createLocalTransportPair

# Function: createLocalTransportPair()

> **createLocalTransportPair**(`options?`): \[[`LocalTransport`](../classes/LocalTransport.md), [`LocalTransport`](../classes/LocalTransport.md)\]

Defined in: [core/router/src/localTransport.ts:217](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/localTransport.ts#L217)

Create a pair of connected local transports for bidirectional communication.
This is the recommended way to connect a local wallet implementation to a router.

## Parameters

### options?

[`LocalTransportOptions`](../interfaces/LocalTransportOptions.md)

Configuration options for both transports

## Returns

\[[`LocalTransport`](../classes/LocalTransport.md), [`LocalTransport`](../classes/LocalTransport.md)\]

A tuple of [clientTransport, serverTransport] that are connected to each other

## Example

```typescript
// Create transports with default options (errors logged)
const [clientTransport, serverTransport] = createLocalTransportPair();

// Create transports that throw errors instead of logging
const [strictClient, strictServer] = createLocalTransportPair({ throwOnError: true });

// Server side (wallet implementation)
const walletNode = new JSONRPCNode(serverTransport, context);
walletNode.registerMethod('eth_accounts', accountsHandler);

// Client side (pass transport directly to router)
const router = new WalletRouter(routerTransport, new Map([
  ['eip155:1', clientTransport]
]), permissionManager);
```
