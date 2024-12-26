[@walletmesh/jsonrpc - v0.0.6](../README.md) / [Exports](../modules.md) / JSONRPCRequest

# Interface: JSONRPCRequest\<T, M, P\>

Represents a JSON-RPC 2.0 request message.

**`Example`**

```typescript
const request: JSONRPCRequest<MethodMap, 'add'> = {
  jsonrpc: '2.0',
  method: 'add',
  params: { a: 1, b: 2 },
  id: 'request-123'
};

// Notification (no response expected)
const notification: JSONRPCRequest<MethodMap, 'log'> = {
  jsonrpc: '2.0',
  method: 'log',
  params: { message: 'Hello' }
};
```

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | extends [`JSONRPCMethodMap`](../modules.md#jsonrpcmethodmap) | The RPC method map defining available methods |
| `M` | extends keyof `T` | The specific method being called |
| `P` | extends [`JSONRPCParams`](../modules.md#jsonrpcparams) = [`JSONRPCParams`](../modules.md#jsonrpcparams) | The parameters type for the method |

## Table of contents

### Properties

- [id](JSONRPCRequest.md#id)
- [jsonrpc](JSONRPCRequest.md#jsonrpc)
- [method](JSONRPCRequest.md#method)
- [params](JSONRPCRequest.md#params)

## Properties

### id

• `Optional` **id**: [`JSONRPCID`](../modules.md#jsonrpcid)

The request ID.

#### Defined in

[packages/jsonrpc/src/types.ts:191](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/jsonrpc/src/types.ts#L191)

___

### jsonrpc

• **jsonrpc**: ``"2.0"``

The JSON-RPC version ('2.0').

#### Defined in

[packages/jsonrpc/src/types.ts:185](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/jsonrpc/src/types.ts#L185)

___

### method

• **method**: `M`

The method name.

#### Defined in

[packages/jsonrpc/src/types.ts:187](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/jsonrpc/src/types.ts#L187)

___

### params

• `Optional` **params**: `P`

The parameters of the method.

#### Defined in

[packages/jsonrpc/src/types.ts:189](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/jsonrpc/src/types.ts#L189)
