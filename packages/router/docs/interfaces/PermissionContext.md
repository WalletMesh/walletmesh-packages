[@walletmesh/router - v0.0.6](../README.md) / [Exports](../modules.md) / PermissionContext

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

[packages/router/src/types.ts:77](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/types.ts#L77)

___

### method

• `Optional` **method**: `string`

Method being called (for call operations)

#### Defined in

[packages/router/src/types.ts:79](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/types.ts#L79)

___

### operation

• **operation**: [`OperationType`](../modules.md#operationtype)

Type of operation being performed

#### Defined in

[packages/router/src/types.ts:75](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/types.ts#L75)

___

### origin

• **origin**: `string`

Origin of the request

#### Defined in

[packages/router/src/types.ts:83](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/types.ts#L83)

___

### params

• `Optional` **params**: `unknown`

Parameters for the operation

#### Defined in

[packages/router/src/types.ts:81](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/types.ts#L81)

___

### session

• `Optional` **session**: [`SessionData`](SessionData.md)

Current session data if available

#### Defined in

[packages/router/src/types.ts:85](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/types.ts#L85)
