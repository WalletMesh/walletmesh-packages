[**@walletmesh/jsonrpc v0.1.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCEventHandler

# Type Alias: JSONRPCEventHandler()\<T, E\>

> **JSONRPCEventHandler**\<`T`, `E`\>: (`params`) => `void`

Represents a function that handles JSON-RPC events.

## Type Parameters

• **T** *extends* [`JSONRPCEventMap`](JSONRPCEventMap.md)

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

[packages/jsonrpc/src/types.ts:369](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/types.ts#L369)
