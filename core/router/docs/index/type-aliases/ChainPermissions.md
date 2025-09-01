[**@walletmesh/router v0.5.2**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / ChainPermissions

# Type Alias: ChainPermissions

> **ChainPermissions** = `Record`\<[`ChainId`](ChainId.md), `string`[]\>

Defined in: [core/router/src/types.ts:206](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/types.ts#L206)

Chain permissions mapping.
Maps chain IDs to arrays of method names that are permitted.
Used for both requesting and storing permissions.
