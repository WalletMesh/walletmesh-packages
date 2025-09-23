[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / TechnologyRequirement

# Interface: TechnologyRequirement

Defined in: [core/discovery/src/types/capabilities.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L26)

Technology requirement for discovery.

Defines a blockchain technology (e.g., EVM, Solana, Aztec) and the
interfaces/features required for that technology. This enables technology-level
discovery where wallets announce support for blockchain types rather than
specific chains.

## Since

0.3.0

## Properties

### features?

> `optional` **features**: `string`[]

Defined in: [core/discovery/src/types/capabilities.ts:44](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L44)

Technology-specific features required.
These are features specific to this blockchain technology.

***

### interfaces

> **interfaces**: `string`[]

Defined in: [core/discovery/src/types/capabilities.ts:38](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L38)

Provider interfaces required for this technology.
Listed in preference order - first match will be used.
Examples: 'eip-1193', 'solana-standard-wallet', 'aztec-connect-v2'

***

### type

> **type**: `"evm"` \| `"solana"` \| `"aztec"`

Defined in: [core/discovery/src/types/capabilities.ts:31](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L31)

Blockchain technology type.
Must be one of the supported technology types.
