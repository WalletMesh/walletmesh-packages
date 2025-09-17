[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / TechnologyMatch

# Interface: TechnologyMatch

Defined in: [core/discovery/src/types/capabilities.ts:106](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/capabilities.ts#L106)

Technology capability match for discovery response.

Represents a matched technology with the specific interface and features
that the wallet supports for that technology.

## Since

0.3.0

## Properties

### features

> **features**: `string`[]

Defined in: [core/discovery/src/types/capabilities.ts:122](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/capabilities.ts#L122)

Supported features for this technology.
Subset of what the wallet supports that matches the requirement.

***

### interfaces

> **interfaces**: `string`[]

Defined in: [core/discovery/src/types/capabilities.ts:116](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/capabilities.ts#L116)

Supported interfaces for this technology.
Subset of what the wallet supports that matches the requirement.

***

### type

> **type**: `"evm"` \| `"solana"` \| `"aztec"`

Defined in: [core/discovery/src/types/capabilities.ts:110](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/capabilities.ts#L110)

Blockchain technology type.
