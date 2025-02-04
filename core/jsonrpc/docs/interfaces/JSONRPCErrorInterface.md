[**@walletmesh/jsonrpc v0.2.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCErrorInterface

# Interface: JSONRPCErrorInterface

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

The error code.

#### Defined in

[packages/jsonrpc/src/types.ts:336](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/types.ts#L336)

***

### data?

> `optional` **data**: `string` \| `Record`\<`string`, `unknown`\>

Additional error data.

#### Defined in

[packages/jsonrpc/src/types.ts:340](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/types.ts#L340)

***

### message

> **message**: `string`

The error message.

#### Defined in

[packages/jsonrpc/src/types.ts:338](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/types.ts#L338)
