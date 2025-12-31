[**@walletmesh/jsonrpc v0.5.4**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCEvent

# Interface: JSONRPCEvent\<T, E\>

Defined in: [core/jsonrpc/src/types.ts:705](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/types.ts#L705)

Represents a JSON-RPC 2.0 event message.
Events are similar to notifications but use 'event' instead of 'method'.
While notifications are used for one-way method calls, events are used
for broadcasting state changes or significant occurrences in the system.

## Example

```typescript
// User joined event
const joinEvent: JSONRPCEvent<EventMap, 'userJoined'> = {
  jsonrpc: '2.0',
  event: 'userJoined',
  params: {
    username: 'Alice',
    timestamp: Date.now()
  }
};

// Status update event
const statusEvent: JSONRPCEvent<EventMap, 'statusUpdate'> = {
  jsonrpc: '2.0',
  event: 'statusUpdate',
  params: {
    user: 'Bob',
    status: 'away',
    lastSeen: Date.now()
  }
};
```

## Type Parameters

### T

`T` *extends* [`JSONRPCEventMap`](JSONRPCEventMap.md)

The event map defining available events and their payload types

### E

`E` *extends* keyof `T`

The specific event being emitted (must be a key of T)

## Properties

### event

> **event**: `E`

Defined in: [core/jsonrpc/src/types.ts:709](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/types.ts#L709)

The event name.

***

### jsonrpc

> **jsonrpc**: `"2.0"`

Defined in: [core/jsonrpc/src/types.ts:707](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/types.ts#L707)

The JSON-RPC version ('2.0').

***

### params

> **params**: `T`\[`E`\]

Defined in: [core/jsonrpc/src/types.ts:711](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/types.ts#L711)

The event payload.
