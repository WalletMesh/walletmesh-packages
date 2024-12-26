[**@walletmesh/jsonrpc v0.1.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCErrorInterface

# Interface: JSONRPCErrorInterface

Represents a JSON-RPC 2.0 error object.

Standard error codes:
- Parse error (-32700)
- Invalid Request (-32600)
- Method not found (-32601)
- Invalid params (-32602)
- Internal error (-32603)
- Server error (-32000 to -32099)

## Example

```typescript
const error: JSONRPCErrorInterface = {
  code: -32600,
  message: 'Invalid Request',
  data: { details: 'Missing required parameter' }
};
```

## Properties

### code

> **code**: `number`

The error code.

#### Defined in

[packages/jsonrpc/src/types.ts:253](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/types.ts#L253)

***

### data?

> `optional` **data**: `string` \| `Record`\<`string`, `unknown`\>

Additional error data.

#### Defined in

[packages/jsonrpc/src/types.ts:257](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/types.ts#L257)

***

### message

> **message**: `string`

The error message.

#### Defined in

[packages/jsonrpc/src/types.ts:255](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/types.ts#L255)
