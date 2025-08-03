[**@walletmesh/router v0.5.1**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / ChainPermissions

# Type Alias: ChainPermissions

> **ChainPermissions** = `Record`\<[`ChainId`](ChainId.md), `string`[]\>

Defined in: [core/router/src/types.ts:206](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/types.ts#L206)

Chain permissions mapping.
Maps chain IDs to arrays of method names that are permitted.
Used for both requesting and storing permissions.
