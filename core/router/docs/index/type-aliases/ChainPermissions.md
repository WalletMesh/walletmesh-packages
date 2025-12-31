[**@walletmesh/router v0.5.4**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / ChainPermissions

# Type Alias: ChainPermissions

> **ChainPermissions** = `Record`\<[`ChainId`](ChainId.md), `string`[]\>

Defined in: [core/router/src/types.ts:206](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/types.ts#L206)

Chain permissions mapping.
Maps chain IDs to arrays of method names that are permitted.
Used for both requesting and storing permissions.
