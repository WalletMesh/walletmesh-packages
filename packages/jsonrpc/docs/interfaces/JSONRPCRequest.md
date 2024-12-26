[**@walletmesh/jsonrpc v0.1.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCRequest

# Interface: JSONRPCRequest\<T, M, P\>

Represents a JSON-RPC 2.0 request message.

## Example

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

## Type Parameters

• **T** *extends* [`JSONRPCMethodMap`](../type-aliases/JSONRPCMethodMap.md)

The RPC method map defining available methods

• **M** *extends* keyof `T`

The specific method being called

• **P** *extends* [`JSONRPCParams`](../type-aliases/JSONRPCParams.md) = [`JSONRPCParams`](../type-aliases/JSONRPCParams.md)

The parameters type for the method

## Properties

### id?

> `optional` **id**: [`JSONRPCID`](../type-aliases/JSONRPCID.md)

The request ID.

#### Defined in

[packages/jsonrpc/src/types.ts:191](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/types.ts#L191)

***

### jsonrpc

> **jsonrpc**: `"2.0"`

The JSON-RPC version ('2.0').

#### Defined in

[packages/jsonrpc/src/types.ts:185](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/types.ts#L185)

***

### method

> **method**: `M`

The method name.

#### Defined in

[packages/jsonrpc/src/types.ts:187](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/types.ts#L187)

***

### params?

> `optional` **params**: `P`

The parameters of the method.

#### Defined in

[packages/jsonrpc/src/types.ts:189](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/types.ts#L189)
