[**@walletmesh/jsonrpc v0.1.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCEventHandler

# Type Alias: JSONRPCEventHandler()\<T, E\>

> **JSONRPCEventHandler**\<`T`, `E`\>: (`params`) => `void`

Represents a function that handles JSON-RPC events.

## Type Parameters

• **T** *extends* [`JSONRPCEventMap`](../interfaces/JSONRPCEventMap.md)

The event map defining available events

• **E** *extends* keyof `T`

The specific event being handled

## Parameters

### params

`T`\[`E`\]

## Returns

`void`

## Example

```typescript
const handler: JSONRPCEventHandler<EventMap, 'userJoined'> =
  ({ username, timestamp }) => {
    console.log(`${username} joined at ${new Date(timestamp)}`);
  };

peer.on('userJoined', handler);
```

## Defined in

[packages/jsonrpc/src/types.ts:369](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/types.ts#L369)
