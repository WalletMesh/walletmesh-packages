[**@walletmesh/router v0.5.1**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / createLocalTransportPair

# Function: createLocalTransportPair()

> **createLocalTransportPair**(): \[[`LocalTransport`](../classes/LocalTransport.md), [`LocalTransport`](../classes/LocalTransport.md)\]

Defined in: [core/router/src/localTransport.ts:105](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/localTransport.ts#L105)

Create a pair of connected local transports for bidirectional communication.
This is the recommended way to connect a local wallet implementation to a router.

## Returns

\[[`LocalTransport`](../classes/LocalTransport.md), [`LocalTransport`](../classes/LocalTransport.md)\]

A tuple of [clientTransport, serverTransport] that are connected to each other

## Example

```typescript
const [clientTransport, serverTransport] = createLocalTransportPair();

// Server side (wallet implementation)
const walletNode = new JSONRPCNode(serverTransport, context);
walletNode.registerMethod('eth_accounts', accountsHandler);

// Client side (pass transport directly to router)
const router = new WalletRouter(routerTransport, new Map([
  ['eip155:1', clientTransport]
]), permissionManager);
```
