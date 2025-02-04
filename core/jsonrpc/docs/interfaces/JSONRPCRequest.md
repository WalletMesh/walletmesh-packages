[**@walletmesh/jsonrpc v0.2.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCRequest

# Interface: JSONRPCRequest\<T, M, P\>

Represents a JSON-RPC 2.0 request message.
Requests can be either method calls (with an ID) or notifications (without an ID).

## Example

```typescript
// Method call with named parameters
const request: JSONRPCRequest<MethodMap, 'add'> = {
  jsonrpc: '2.0',
  method: 'add',
  params: { a: 1, b: 2 },
  id: 'request-123'
};

// Method call with positional parameters
const request: JSONRPCRequest<MethodMap, 'multiply'> = {
  jsonrpc: '2.0',
  method: 'multiply',
  params: [3, 4],
  id: 456
};

// Notification (no response expected)
const notification: JSONRPCRequest<MethodMap, 'log'> = {
  jsonrpc: '2.0',
  method: 'log',
  params: { message: 'Hello' }
  // No id field for notifications
};
```

## Type Parameters

• **T** *extends* [`JSONRPCMethodMap`](JSONRPCMethodMap.md)

The RPC method map defining available methods and their types

• **M** *extends* keyof `T` = keyof `T`

The specific method name being called (must be a key of T)

• **P** *extends* [`JSONRPCParams`](../type-aliases/JSONRPCParams.md) = [`JSONRPCParams`](../type-aliases/JSONRPCParams.md)

The parameters type for the method (defaults to JSONRPCParams)

## Properties

### id?

> `optional` **id**: [`JSONRPCID`](../type-aliases/JSONRPCID.md)

The request ID.

#### Defined in

[packages/jsonrpc/src/types.ts:254](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/types.ts#L254)

***

### jsonrpc

> **jsonrpc**: `"2.0"`

The JSON-RPC version ('2.0').

#### Defined in

[packages/jsonrpc/src/types.ts:248](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/types.ts#L248)

***

### method

> **method**: `M`

The method name.

#### Defined in

[packages/jsonrpc/src/types.ts:250](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/types.ts#L250)

***

### params?

> `optional` **params**: `P`

The parameters of the method.

#### Defined in

[packages/jsonrpc/src/types.ts:252](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/types.ts#L252)
