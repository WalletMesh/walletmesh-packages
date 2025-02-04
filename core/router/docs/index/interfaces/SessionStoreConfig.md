[**@walletmesh/router v0.2.7**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / SessionStoreConfig

# Interface: SessionStoreConfig

## Properties

### lifetime?

> `optional` **lifetime**: `number`

Session lifetime in milliseconds. If not provided, sessions never expire

#### Defined in

[packages/router/src/session-store.ts:3](https://github.com/WalletMesh/wm-core/blob/a301044367e6b9b3eb697a31c54886b183ad9507/packages/router/src/session-store.ts#L3)

***

### refreshOnAccess?

> `optional` **refreshOnAccess**: `boolean`

Whether to refresh session expiry on access. Default false

#### Defined in

[packages/router/src/session-store.ts:5](https://github.com/WalletMesh/wm-core/blob/a301044367e6b9b3eb697a31c54886b183ad9507/packages/router/src/session-store.ts#L5)
