[**@walletmesh/jsonrpc v0.1.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCEvent

# Interface: JSONRPCEvent\<T, E\>

Represents a JSON-RPC 2.0 event message.
Events are similar to notifications but use 'event' instead of 'method'.

## Example

```typescript
const event: JSONRPCEvent<EventMap, 'userJoined'> = {
  jsonrpc: '2.0',
  event: 'userJoined',
  params: {
    username: 'Alice',
    timestamp: Date.now()
  }
};
```

## Type Parameters

• **T** *extends* [`JSONRPCEventMap`](../type-aliases/JSONRPCEventMap.md)

The event map defining available events

• **E** *extends* keyof `T`

The specific event being emitted

## Properties

### event

> **event**: `E`

The event name.

#### Defined in

[packages/jsonrpc/src/types.ts:348](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/types.ts#L348)

***

### jsonrpc

> **jsonrpc**: `"2.0"`

The JSON-RPC version ('2.0').

#### Defined in

[packages/jsonrpc/src/types.ts:346](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/types.ts#L346)

***

### params

> **params**: `T`\[`E`\]

The event payload.

#### Defined in

[packages/jsonrpc/src/types.ts:350](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/types.ts#L350)
