[@walletmesh/jsonrpc - v0.1.0](../README.md) / [Exports](../modules.md) / JSONRPCResponse

# Interface: JSONRPCResponse\<T, M\>

Represents a JSON-RPC 2.0 response message.

**`Example`**

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

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | extends [`JSONRPCMethodMap`](../modules.md#jsonrpcmethodmap) | The RPC method map defining available methods |
| `M` | extends keyof `T` = keyof `T` | The specific method that was called |

## Table of contents

### Properties

- [error](JSONRPCResponse.md#error)
- [id](JSONRPCResponse.md#id)
- [jsonrpc](JSONRPCResponse.md#jsonrpc)
- [result](JSONRPCResponse.md#result)

## Properties

### error

• `Optional` **error**: [`JSONRPCErrorInterface`](JSONRPCErrorInterface.md)

The error object, if an error occurred.

#### Defined in

[packages/jsonrpc/src/types.ts:226](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/types.ts#L226)

___

### id

• **id**: [`JSONRPCID`](../modules.md#jsonrpcid)

The request ID.

#### Defined in

[packages/jsonrpc/src/types.ts:228](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/types.ts#L228)

___

### jsonrpc

• **jsonrpc**: ``"2.0"``

The JSON-RPC version ('2.0').

#### Defined in

[packages/jsonrpc/src/types.ts:222](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/types.ts#L222)

___

### result

• `Optional` **result**: `T`[`M`][``"result"``]

The result of the method call, if successful. Can be modified by middleware.

#### Defined in

[packages/jsonrpc/src/types.ts:224](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/types.ts#L224)
