[**@walletmesh/jsonrpc v0.2.1**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCEvent

# Interface: JSONRPCEvent\<T, E\>

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

The event name.

#### Defined in

[packages/jsonrpc/src/types.ts:572](https://github.com/WalletMesh/wm-core/blob/a9df9bbf5472f2e76d37a4177ff0bdcc90012260/packages/jsonrpc/src/types.ts#L572)

***

### jsonrpc

> **jsonrpc**: `"2.0"`

The JSON-RPC version ('2.0').

#### Defined in

[packages/jsonrpc/src/types.ts:570](https://github.com/WalletMesh/wm-core/blob/a9df9bbf5472f2e76d37a4177ff0bdcc90012260/packages/jsonrpc/src/types.ts#L570)

***

### params

> **params**: `T`\[`E`\]

The event payload.

#### Defined in

[packages/jsonrpc/src/types.ts:574](https://github.com/WalletMesh/wm-core/blob/a9df9bbf5472f2e76d37a4177ff0bdcc90012260/packages/jsonrpc/src/types.ts#L574)
