[@walletmesh/router - v0.0.5](../README.md) / [Exports](../modules.md) / PermissionContext

# Interface: PermissionContext

Context provided to permission callbacks

## Table of contents

### Properties

- [chainId](PermissionContext.md#chainid)
- [method](PermissionContext.md#method)
- [operation](PermissionContext.md#operation)
- [origin](PermissionContext.md#origin)
- [params](PermissionContext.md#params)
- [session](PermissionContext.md#session)

## Properties

### chainId

• **chainId**: `string`

Chain ID the operation targets

#### Defined in

[packages/router/src/types.ts:32](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/types.ts#L32)

___

### method

• `Optional` **method**: `string`

Method being called (for call operations)

#### Defined in

[packages/router/src/types.ts:34](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/types.ts#L34)

___

### operation

• **operation**: [`OperationType`](../modules.md#operationtype)

Type of operation being performed

#### Defined in

[packages/router/src/types.ts:30](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/types.ts#L30)

___

### origin

• **origin**: `string`

Origin of the request

#### Defined in

[packages/router/src/types.ts:38](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/types.ts#L38)

___

### params

• `Optional` **params**: `unknown`

Parameters for the operation

#### Defined in

[packages/router/src/types.ts:36](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/types.ts#L36)

___

### session

• `Optional` **session**: [`SessionData`](SessionData.md)

Current session data if available

#### Defined in

[packages/router/src/types.ts:40](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/types.ts#L40)
