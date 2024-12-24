[@walletmesh/jsonrpc - v0.0.5](../README.md) / [Exports](../modules.md) / JSONRPCRequest

# Interface: JSONRPCRequest\<T, M, P\>

JSON-RPC 2.0 Request interface.

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | extends [`JSONRPCMethodMap`](../modules.md#jsonrpcmethodmap) | The RPC method map. |
| `M` | extends keyof `T` | The method name. |
| `P` | extends [`JSONRPCParams`](../modules.md#jsonrpcparams) = [`JSONRPCParams`](../modules.md#jsonrpcparams) | - |

## Table of contents

### Properties

- [id](JSONRPCRequest.md#id)
- [jsonrpc](JSONRPCRequest.md#jsonrpc)
- [method](JSONRPCRequest.md#method)
- [params](JSONRPCRequest.md#params)

## Properties

### id

• `Optional` **id**: [`JSONRPCID`](../modules.md#jsonrpcid)

The request ID.

#### Defined in

[packages/jsonrpc/src/types.ts:93](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/types.ts#L93)

___

### jsonrpc

• **jsonrpc**: ``"2.0"``

The JSON-RPC version ('2.0').

#### Defined in

[packages/jsonrpc/src/types.ts:87](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/types.ts#L87)

___

### method

• **method**: `M`

The method name.

#### Defined in

[packages/jsonrpc/src/types.ts:89](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/types.ts#L89)

___

### params

• `Optional` **params**: `P`

The parameters of the method.

#### Defined in

[packages/jsonrpc/src/types.ts:91](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/types.ts#L91)
