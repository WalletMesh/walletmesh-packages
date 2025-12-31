[**@walletmesh/discovery v0.1.4**](../README.md)

***

[@walletmesh/discovery](../globals.md) / TechnologyRequirement

# Interface: TechnologyRequirement

Defined in: [core/discovery/src/types/capabilities.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/capabilities.ts#L24)

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

Defined in: [core/discovery/src/types/capabilities.ts:42](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/capabilities.ts#L42)

Technology-specific features required.
These are features specific to this blockchain technology.

***

### interfaces

> **interfaces**: `string`[]

Defined in: [core/discovery/src/types/capabilities.ts:36](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/capabilities.ts#L36)

Provider interfaces required for this technology.
Listed in preference order - first match will be used.
Examples: 'eip-1193', 'solana-standard-wallet', 'aztec-connect-v2'

***

### type

> **type**: `"evm"` \| `"solana"` \| `"aztec"`

Defined in: [core/discovery/src/types/capabilities.ts:29](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/capabilities.ts#L29)

Blockchain technology type.
Must be one of the supported technology types.
