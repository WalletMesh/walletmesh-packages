[**@walletmesh/jsonrpc v0.4.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCEvent

# Interface: JSONRPCEvent\<T, E\>

Defined in: [core/jsonrpc/src/types.ts:569](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/types.ts#L569)

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

• **T** *extends* [`JSONRPCEventMap`](JSONRPCEventMap.md)

The event map defining available events and their payload types

• **E** *extends* keyof `T`

The specific event being emitted (must be a key of T)

## Properties

### event

> **event**: `E`

Defined in: [core/jsonrpc/src/types.ts:573](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/types.ts#L573)

The event name.

***

### jsonrpc

> **jsonrpc**: `"2.0"`

Defined in: [core/jsonrpc/src/types.ts:571](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/types.ts#L571)

The JSON-RPC version ('2.0').

***

### params

> **params**: `T`\[`E`\]

Defined in: [core/jsonrpc/src/types.ts:575](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/types.ts#L575)

The event payload.
