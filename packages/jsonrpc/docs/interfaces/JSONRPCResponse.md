[**@walletmesh/jsonrpc v0.1.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCResponse

# Interface: JSONRPCResponse\<T, M\>

Represents a JSON-RPC 2.0 response message.

## Example

```typescript
// Successful response
const response: JSONRPCResponse<MethodMap, 'add'> = {
  jsonrpc: '2.0',
  result: 3,
  id: 'request-123'
};

// Error response
const errorResponse: JSONRPCResponse<MethodMap> = {
  jsonrpc: '2.0',
  error: {
    code: -32600,
    message: 'Invalid Request'
  },
  id: 'request-123'
};
```

## Type Parameters

• **T** *extends* [`JSONRPCMethodMap`](JSONRPCMethodMap.md)

The RPC method map defining available methods

• **M** *extends* keyof `T` = keyof `T`

The specific method that was called

## Properties

### error?

> `optional` **error**: [`JSONRPCErrorInterface`](JSONRPCErrorInterface.md)

The error object, if an error occurred.

#### Defined in

[packages/jsonrpc/src/types.ts:226](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/types.ts#L226)

***

### id

> **id**: [`JSONRPCID`](../type-aliases/JSONRPCID.md)

The request ID.

#### Defined in

[packages/jsonrpc/src/types.ts:228](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/types.ts#L228)

***

### jsonrpc

> **jsonrpc**: `"2.0"`

The JSON-RPC version ('2.0').

#### Defined in

[packages/jsonrpc/src/types.ts:222](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/types.ts#L222)

***

### result?

> `optional` **result**: `T`\[`M`\]\[`"result"`\]

The result of the method call, if successful. Can be modified by middleware.

#### Defined in

[packages/jsonrpc/src/types.ts:224](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/types.ts#L224)
