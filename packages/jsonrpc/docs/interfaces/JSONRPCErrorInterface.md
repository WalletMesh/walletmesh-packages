[@walletmesh/jsonrpc - v0.0.5](../README.md) / [Exports](../modules.md) / JSONRPCErrorInterface

# Interface: JSONRPCErrorInterface

JSON-RPC 2.0 Error interface.

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

[packages/jsonrpc/src/types.ts:118](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/types.ts#L118)

___

### data

• `Optional` **data**: `string` \| `Record`\<`string`, `unknown`\>

Additional error data.

#### Defined in

[packages/jsonrpc/src/types.ts:122](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/types.ts#L122)

___

### message

• **message**: `string`

The error message.

#### Defined in

[packages/jsonrpc/src/types.ts:120](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/types.ts#L120)
