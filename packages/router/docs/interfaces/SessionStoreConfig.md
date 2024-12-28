[**@walletmesh/router v0.1.5**](../README.md)

***

[@walletmesh/router](../globals.md) / SessionStoreConfig

# Interface: SessionStoreConfig

## Properties

### lifetime?

> `optional` **lifetime**: `number`

Session lifetime in milliseconds. If not provided, sessions never expire

#### Defined in

[packages/router/src/session-store.ts:3](https://github.com/WalletMesh/wm-core/blob/06ce1e7f0406bfb5c73f5b66aebbea66acb5497d/packages/router/src/session-store.ts#L3)

***

### refreshOnAccess?

> `optional` **refreshOnAccess**: `boolean`

Whether to refresh session expiry on access. Default false

#### Defined in

[packages/router/src/session-store.ts:5](https://github.com/WalletMesh/wm-core/blob/06ce1e7f0406bfb5c73f5b66aebbea66acb5497d/packages/router/src/session-store.ts#L5)
