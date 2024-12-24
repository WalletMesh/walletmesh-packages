[@walletmesh/jsonrpc - v0.0.5](../README.md) / [Exports](../modules.md) / JSONRPCResponse

# Interface: JSONRPCResponse\<T, M\>

JSON-RPC 2.0 Response interface.

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | extends [`JSONRPCMethodMap`](../modules.md#jsonrpcmethodmap) | The RPC method map. |
| `M` | extends keyof `T` | The method name. |

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

[packages/jsonrpc/src/types.ts:108](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/types.ts#L108)

___

### id

• **id**: [`JSONRPCID`](../modules.md#jsonrpcid)

The request ID.

#### Defined in

[packages/jsonrpc/src/types.ts:110](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/types.ts#L110)

___

### jsonrpc

• **jsonrpc**: ``"2.0"``

The JSON-RPC version ('2.0').

#### Defined in

[packages/jsonrpc/src/types.ts:104](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/types.ts#L104)

___

### result

• `Optional` **result**: `T`[`M`][``"result"``]

The result of the method call, if successful.

#### Defined in

[packages/jsonrpc/src/types.ts:106](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/types.ts#L106)
