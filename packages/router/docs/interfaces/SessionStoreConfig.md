[**@walletmesh/router v0.1.6**](../README.md)

***

[@walletmesh/router](../globals.md) / SessionStoreConfig

# Interface: SessionStoreConfig

## Properties

### lifetime?

> `optional` **lifetime**: `number`

Session lifetime in milliseconds. If not provided, sessions never expire

#### Defined in

[packages/router/src/session-store.ts:3](https://github.com/WalletMesh/wm-core/blob/55735390cf4c8a0d047a109e33e2c0437d867c8e/packages/router/src/session-store.ts#L3)

***

### refreshOnAccess?

> `optional` **refreshOnAccess**: `boolean`

Whether to refresh session expiry on access. Default false

#### Defined in

[packages/router/src/session-store.ts:5](https://github.com/WalletMesh/wm-core/blob/55735390cf4c8a0d047a109e33e2c0437d867c8e/packages/router/src/session-store.ts#L5)
