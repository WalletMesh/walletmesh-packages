[**@walletmesh/router v0.5.1**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / ChainPermissions

# Type Alias: ChainPermissions

> **ChainPermissions** = `Record`\<[`ChainId`](ChainId.md), `string`[]\>

Defined in: [core/router/src/types.ts:206](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/types.ts#L206)

Chain permissions mapping.
Maps chain IDs to arrays of method names that are permitted.
Used for both requesting and storing permissions.
