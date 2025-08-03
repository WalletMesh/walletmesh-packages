[**@walletmesh/router v0.5.1**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / createLocalTransport

# Function: createLocalTransport()

> **createLocalTransport**(`remoteNode`, `options?`): [`LocalTransport`](../classes/LocalTransport.md)

Defined in: [core/router/src/localTransport.ts:224](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/localTransport.ts#L224)

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
