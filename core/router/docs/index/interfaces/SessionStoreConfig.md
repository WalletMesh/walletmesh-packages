[**@walletmesh/router v0.5.2**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / SessionStoreConfig

# Interface: SessionStoreConfig

Defined in: [core/router/src/session-store.ts:1](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/session-store.ts#L1)

## Properties

### lifetime?

> `optional` **lifetime**: `number`

Defined in: [core/router/src/session-store.ts:3](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/session-store.ts#L3)

Session lifetime in milliseconds. If not provided, sessions never expire

***

### refreshOnAccess?

> `optional` **refreshOnAccess**: `boolean`

Defined in: [core/router/src/session-store.ts:5](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/session-store.ts#L5)

Whether to refresh session expiry on access. Default false
