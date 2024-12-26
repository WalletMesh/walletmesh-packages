[@walletmesh/jsonrpc - v0.1.0](../README.md) / [Exports](../modules.md) / JSONRPCEvent

# Interface: JSONRPCEvent\<T, E\>

Represents a JSON-RPC 2.0 event message.
Events are similar to notifications but use 'event' instead of 'method'.

**`Example`**

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

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | extends [`JSONRPCEventMap`](../modules.md#jsonrpceventmap) | The event map defining available events |
| `E` | extends keyof `T` | The specific event being emitted |

## Table of contents

### Properties

- [event](JSONRPCEvent.md#event)
- [jsonrpc](JSONRPCEvent.md#jsonrpc)
- [params](JSONRPCEvent.md#params)

## Properties

### event

• **event**: `E`

The event name.

#### Defined in

[packages/jsonrpc/src/types.ts:348](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/types.ts#L348)

___

### jsonrpc

• **jsonrpc**: ``"2.0"``

The JSON-RPC version ('2.0').

#### Defined in

[packages/jsonrpc/src/types.ts:346](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/types.ts#L346)

___

### params

• **params**: `T`[`E`]

The event payload.

#### Defined in

[packages/jsonrpc/src/types.ts:350](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/types.ts#L350)
