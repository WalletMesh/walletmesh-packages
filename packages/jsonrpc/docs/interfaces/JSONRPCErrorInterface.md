[@walletmesh/jsonrpc - v0.0.6](../README.md) / [Exports](../modules.md) / JSONRPCErrorInterface

# Interface: JSONRPCErrorInterface

Represents a JSON-RPC 2.0 error object.

Standard error codes:
- Parse error (-32700)
- Invalid Request (-32600)
- Method not found (-32601)
- Invalid params (-32602)
- Internal error (-32603)
- Server error (-32000 to -32099)

**`Example`**

```typescript
const error: JSONRPCErrorInterface = {
  code: -32600,
  message: 'Invalid Request',
  data: { details: 'Missing required parameter' }
};
```

## Implemented by

- [`JSONRPCError`](../classes/JSONRPCError.md)

## Table of contents

### Properties

- [code](JSONRPCErrorInterface.md#code)
- [data](JSONRPCErrorInterface.md#data)
- [message](JSONRPCErrorInterface.md#message)

## Properties

### code

• **code**: `number`

The error code.

#### Defined in

[packages/jsonrpc/src/types.ts:253](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/jsonrpc/src/types.ts#L253)

___

### data

• `Optional` **data**: `string` \| `Record`\<`string`, `unknown`\>

Additional error data.

#### Defined in

[packages/jsonrpc/src/types.ts:257](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/jsonrpc/src/types.ts#L257)

___

### message

• **message**: `string`

The error message.

#### Defined in

[packages/jsonrpc/src/types.ts:255](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/jsonrpc/src/types.ts#L255)
