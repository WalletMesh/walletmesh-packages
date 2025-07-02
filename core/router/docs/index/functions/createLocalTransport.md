[**@walletmesh/router v0.5.1**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / createLocalTransport

# Function: createLocalTransport()

> **createLocalTransport**(`remoteNode`): [`LocalTransport`](../classes/LocalTransport.md)

Defined in: [core/router/src/localTransport.ts:140](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/localTransport.ts#L140)

Create a local transport that connects to an existing JSONRPCNode.
This is useful when you already have a node instance and want to
create a transport that sends messages to it.

## Parameters

### remoteNode

`JSONRPCNode`\<`JSONRPCMethodMap`, `JSONRPCEventMap`, `JSONRPCContext`\>

The JSONRPCNode to connect to

## Returns

[`LocalTransport`](../classes/LocalTransport.md)

A transport that sends messages to the remote node

## Example

```typescript
const existingNode = new JSONRPCNode(...);
const transport = createLocalTransport(existingNode);
const newNode = new JSONRPCNode(transport, context);
```
