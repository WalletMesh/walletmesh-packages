[**@walletmesh/router v0.2.5**](../README.md)

***

[@walletmesh/router](../globals.md) / SessionStoreConfig

# Interface: SessionStoreConfig

## Properties

### lifetime?

> `optional` **lifetime**: `number`

Session lifetime in milliseconds. If not provided, sessions never expire

#### Defined in

[packages/router/src/session-store.ts:3](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/session-store.ts#L3)

***

### refreshOnAccess?

> `optional` **refreshOnAccess**: `boolean`

Whether to refresh session expiry on access. Default false

#### Defined in

[packages/router/src/session-store.ts:5](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/session-store.ts#L5)
