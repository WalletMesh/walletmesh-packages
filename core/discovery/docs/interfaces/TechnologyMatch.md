[**@walletmesh/discovery v0.1.4**](../README.md)

***

[@walletmesh/discovery](../globals.md) / TechnologyMatch

# Interface: TechnologyMatch

Defined in: [core/discovery/src/types/capabilities.ts:110](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/capabilities.ts#L110)

## Properties

### features

> **features**: `string`[]

Defined in: [core/discovery/src/types/capabilities.ts:126](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/capabilities.ts#L126)

Supported features for this technology.
Subset of what the wallet supports that matches the requirement.

***

### interfaces

> **interfaces**: `string`[]

Defined in: [core/discovery/src/types/capabilities.ts:120](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/capabilities.ts#L120)

Supported interfaces for this technology.
Subset of what the wallet supports that matches the requirement.

***

### type

> **type**: `"evm"` \| `"solana"` \| `"aztec"`

Defined in: [core/discovery/src/types/capabilities.ts:114](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/capabilities.ts#L114)

Blockchain technology type.
