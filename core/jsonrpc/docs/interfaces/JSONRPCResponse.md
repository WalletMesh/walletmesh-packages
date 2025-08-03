[**@walletmesh/jsonrpc v0.5.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCResponse

# Interface: JSONRPCResponse\<T, M\>

Defined in: [core/jsonrpc/src/types.ts:303](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/types.ts#L303)

Represents a JSON-RPC 2.0 response message.
A response must include either a result (for success) or an error (for failure),
but never both. The id field must match the id from the request.

## Example

```typescript
// Successful response with primitive result
const response: JSONRPCResponse<MethodMap, 'add'> = {
  jsonrpc: '2.0',
  result: 3,
  id: 'request-123'
};

// Successful response with object result
const response: JSONRPCResponse<MethodMap, 'getUser'> = {
  jsonrpc: '2.0',
  result: { id: 123, name: 'Alice' },
  id: 'request-456'
};

// Error response
const errorResponse: JSONRPCResponse<MethodMap> = {
  jsonrpc: '2.0',
  error: {
    code: -32600,
    message: 'Invalid Request',
    data: { details: 'Missing required parameter: id' }
  },
  id: 'request-123'
};

// Error response for invalid request (null id)
const invalidResponse: JSONRPCResponse<MethodMap> = {
  jsonrpc: '2.0',
  error: {
    code: -32600,
    message: 'Invalid Request'
  },
  id: null
};
```

## Type Parameters

### T

`T` *extends* [`JSONRPCMethodMap`](JSONRPCMethodMap.md)

The RPC method map defining available methods and their types

### M

`M` *extends* keyof `T` = keyof `T`

The specific method that was called (must be a key of T)

## Properties

### error?

> `optional` **error**: [`JSONRPCErrorInterface`](JSONRPCErrorInterface.md)

Defined in: [core/jsonrpc/src/types.ts:309](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/types.ts#L309)

The error object, if an error occurred.

***

### id

> **id**: [`JSONRPCID`](../type-aliases/JSONRPCID.md)

Defined in: [core/jsonrpc/src/types.ts:311](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/types.ts#L311)

The request ID.

***

### jsonrpc

> **jsonrpc**: `"2.0"`

Defined in: [core/jsonrpc/src/types.ts:305](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/types.ts#L305)

The JSON-RPC version ('2.0').

***

### result?

> `optional` **result**: `T`\[`M`\]\[`"result"`\]

Defined in: [core/jsonrpc/src/types.ts:307](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/types.ts#L307)

The result of the method call, if successful. Can be modified by middleware.
