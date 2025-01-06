[**@walletmesh/jsonrpc v0.2.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCResponse

# Interface: JSONRPCResponse\<T, M\>

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

• **T** *extends* [`JSONRPCMethodMap`](JSONRPCMethodMap.md)

The RPC method map defining available methods and their types

• **M** *extends* keyof `T` = keyof `T`

The specific method that was called (must be a key of T)

## Properties

### error?

> `optional` **error**: [`JSONRPCErrorInterface`](JSONRPCErrorInterface.md)

The error object, if an error occurred.

#### Defined in

[packages/jsonrpc/src/types.ts:309](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/types.ts#L309)

***

### id

> **id**: [`JSONRPCID`](../type-aliases/JSONRPCID.md)

The request ID.

#### Defined in

[packages/jsonrpc/src/types.ts:311](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/types.ts#L311)

***

### jsonrpc

> **jsonrpc**: `"2.0"`

The JSON-RPC version ('2.0').

#### Defined in

[packages/jsonrpc/src/types.ts:305](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/types.ts#L305)

***

### result?

> `optional` **result**: `T`\[`M`\]\[`"result"`\]

The result of the method call, if successful. Can be modified by middleware.

#### Defined in

[packages/jsonrpc/src/types.ts:307](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/types.ts#L307)
