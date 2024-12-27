[**@walletmesh/jsonrpc v0.1.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / Transport

# Type Alias: Transport\<T, E\>

> **Transport**\<`T`, `E`\>: `object`

Transport interface for sending JSON-RPC messages between nodes.
This interface abstracts the actual message transmission mechanism,
allowing the node to work with any transport layer (WebSocket, postMessage, etc.).

## Type Parameters

• **T** *extends* [`JSONRPCMethodMap`](../interfaces/JSONRPCMethodMap.md)

The RPC method map defining available methods

• **E** *extends* [`JSONRPCEventMap`](../interfaces/JSONRPCEventMap.md)

The event map defining available events

## Type declaration

### send()

> **send**: (`message`) => `void`

Sends a JSON-RPC message to the remote node.

#### Parameters

##### message

The message to send (request, response, or event)

[`JSONRPCRequest`](../interfaces/JSONRPCRequest.md)\<`T`, keyof `T`\> | [`JSONRPCResponse`](../interfaces/JSONRPCResponse.md)\<`T`\> | [`JSONRPCEvent`](../interfaces/JSONRPCEvent.md)\<`E`, keyof `E`\>

#### Returns

`void`

## Example

```typescript
// WebSocket transport
const wsTransport: Transport<MethodMap, EventMap> = {
  send: message => ws.send(JSON.stringify(message))
};

// postMessage transport
const windowTransport: Transport<MethodMap, EventMap> = {
  send: message => window.postMessage(JSON.stringify(message), '*')
};

// Custom transport with encryption
const encryptedTransport: Transport<MethodMap, EventMap> = {
  send: message => {
    const encrypted = encrypt(JSON.stringify(message));
    socket.send(encrypted);
  }
};
```

## Defined in

[packages/jsonrpc/src/node.ts:46](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/node.ts#L46)
