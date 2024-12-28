[**@walletmesh/router v0.1.4**](../README.md)

***

[@walletmesh/router](../globals.md) / PermissionContext

# Interface: PermissionContext

Context provided to permission callbacks

## Properties

### chainId

> **chainId**: `string`

Chain ID the operation targets

#### Defined in

[packages/router/src/types.ts:77](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/types.ts#L77)

***

### method?

> `optional` **method**: `string`

Method being called (for call operations)

#### Defined in

[packages/router/src/types.ts:79](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/types.ts#L79)

***

### operation

> **operation**: [`OperationType`](../type-aliases/OperationType.md)

Type of operation being performed

#### Defined in

[packages/router/src/types.ts:75](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/types.ts#L75)

***

### origin

> **origin**: `string`

Origin of the request

#### Defined in

[packages/router/src/types.ts:83](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/types.ts#L83)

***

### params?

> `optional` **params**: `unknown`

Parameters for the operation

#### Defined in

[packages/router/src/types.ts:81](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/types.ts#L81)

***

### session?

> `optional` **session**: [`SessionData`](SessionData.md)

Current session data if available

#### Defined in

[packages/router/src/types.ts:85](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/types.ts#L85)
