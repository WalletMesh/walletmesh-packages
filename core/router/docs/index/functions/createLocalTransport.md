[**@walletmesh/router v0.5.2**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / createLocalTransport

# Function: createLocalTransport()

> **createLocalTransport**(`remoteNode`, `options?`): [`LocalTransport`](../classes/LocalTransport.md)

Defined in: [core/router/src/localTransport.ts:224](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/localTransport.ts#L224)

Create a local transport that connects to an existing JSONRPCNode.
This is useful when you already have a node instance and want to
create a transport that sends messages to it.

## Parameters

### remoteNode

`JSONRPCNode`\<`JSONRPCMethodMap`, `JSONRPCEventMap`, `JSONRPCContext`\>

The JSONRPCNode to connect to

### options?

[`LocalTransportOptions`](../interfaces/LocalTransportOptions.md)

Configuration options for the transport

## Returns

[`LocalTransport`](../classes/LocalTransport.md)

A transport that sends messages to the remote node

## Example

```typescript
const existingNode = new JSONRPCNode(...);
const transport = createLocalTransport(existingNode);
const newNode = new JSONRPCNode(transport, context);
```
