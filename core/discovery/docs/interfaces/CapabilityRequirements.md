[**@walletmesh/discovery v0.1.3**](../README.md)

***

[@walletmesh/discovery](../globals.md) / CapabilityRequirements

# Interface: CapabilityRequirements

Defined in: [core/discovery/src/types/capabilities.ts:54](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/capabilities.ts#L54)

Capability requirements specification for responder discovery.

Capabilities represent the complete set of functionalities a wallet can provide,
organized into technology-based requirements and global features.

## Since

0.1.0

## Properties

### features

> **features**: `string`[]

Defined in: [core/discovery/src/types/capabilities.ts:68](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/capabilities.ts#L68)

Global wallet features that must be available.
These represent wallet-level functionalities beyond specific blockchain support,
such as hardware security, multi-account support, or session management.
See RESPONDER_FEATURES for standard values.

***

### networks?

> `optional` **networks**: `string`[]

Defined in: [core/discovery/src/types/capabilities.ts:77](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/capabilities.ts#L77)

Specific networks required (CAIP-2 format).
Examples: 'eip155:1' (Ethereum mainnet), 'aztec:31337' (Aztec sandbox), 'solana:mainnet'
If specified, wallet must support at least one of these networks to match.
Networks are independent of technology support - a wallet might support Aztec technology
on multiple networks.

***

### technologies

> **technologies**: [`TechnologyRequirement`](TechnologyRequirement.md)[]

Defined in: [core/discovery/src/types/capabilities.ts:60](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/capabilities.ts#L60)

Blockchain technologies that must be supported.
Each technology includes its required interfaces and features.
Wallets must support at least the interfaces listed for each technology.
