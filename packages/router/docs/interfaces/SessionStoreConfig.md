[@walletmesh/router - v0.0.5](../README.md) / [Exports](../modules.md) / SessionStoreConfig

# Interface: SessionStoreConfig

## Table of contents

### Properties

- [lifetime](SessionStoreConfig.md#lifetime)
- [refreshOnAccess](SessionStoreConfig.md#refreshonaccess)

## Properties

### lifetime

• `Optional` **lifetime**: `number`

Session lifetime in milliseconds. If not provided, sessions never expire

#### Defined in

[packages/router/src/session-store.ts:3](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/session-store.ts#L3)

___

### refreshOnAccess

• `Optional` **refreshOnAccess**: `boolean`

Whether to refresh session expiry on access. Default false

#### Defined in

[packages/router/src/session-store.ts:5](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/session-store.ts#L5)
