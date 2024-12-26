[**@walletmesh/router v0.1.0**](../README.md)

***

[@walletmesh/router](../globals.md) / SessionStoreConfig

# Interface: SessionStoreConfig

## Properties

### lifetime?

> `optional` **lifetime**: `number`

Session lifetime in milliseconds. If not provided, sessions never expire

#### Defined in

[packages/router/src/session-store.ts:3](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/router/src/session-store.ts#L3)

***

### refreshOnAccess?

> `optional` **refreshOnAccess**: `boolean`

Whether to refresh session expiry on access. Default false

#### Defined in

[packages/router/src/session-store.ts:5](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/router/src/session-store.ts#L5)
