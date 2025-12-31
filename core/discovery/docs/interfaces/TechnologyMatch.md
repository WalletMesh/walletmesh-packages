[**@walletmesh/discovery v0.1.3**](../README.md)

***

[@walletmesh/discovery](../globals.md) / TechnologyMatch

# Interface: TechnologyMatch

Defined in: [core/discovery/src/types/capabilities.ts:110](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/capabilities.ts#L110)

## Properties

### features

> **features**: `string`[]

Defined in: [core/discovery/src/types/capabilities.ts:126](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/capabilities.ts#L126)

Supported features for this technology.
Subset of what the wallet supports that matches the requirement.

***

### interfaces

> **interfaces**: `string`[]

Defined in: [core/discovery/src/types/capabilities.ts:120](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/capabilities.ts#L120)

Supported interfaces for this technology.
Subset of what the wallet supports that matches the requirement.

***

### type

> **type**: `"evm"` \| `"solana"` \| `"aztec"`

Defined in: [core/discovery/src/types/capabilities.ts:114](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/capabilities.ts#L114)

Blockchain technology type.
