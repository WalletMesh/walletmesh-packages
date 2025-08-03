[**@walletmesh/jsonrpc v0.5.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCErrorInterface

# Interface: JSONRPCErrorInterface

Defined in: [core/jsonrpc/src/types.ts:334](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/types.ts#L334)

Represents a JSON-RPC 2.0 error object.

Standard error codes:
- Parse error (-32700): Invalid JSON was received
- Invalid Request (-32600): The JSON sent is not a valid Request object
- Method not found (-32601): The method does not exist / is not available
- Invalid params (-32602): Invalid method parameter(s)
- Internal error (-32603): Internal JSON-RPC error
- Server error (-32000 to -32099): Implementation-defined server errors

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

Defined in: [core/jsonrpc/src/types.ts:336](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/types.ts#L336)

The error code.

***

### data?

> `optional` **data**: `string` \| `Record`\<`string`, `unknown`\>

Defined in: [core/jsonrpc/src/types.ts:340](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/types.ts#L340)

Additional error data.

***

### message

> **message**: `string`

Defined in: [core/jsonrpc/src/types.ts:338](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/types.ts#L338)

The error message.
