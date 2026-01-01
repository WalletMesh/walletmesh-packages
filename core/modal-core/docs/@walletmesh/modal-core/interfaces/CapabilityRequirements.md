[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / CapabilityRequirements

# Interface: CapabilityRequirements

Capability requirements specification for responder discovery.

Capabilities represent the complete set of functionalities a wallet can provide,
organized into technology-based requirements and global features.

## Since

0.1.0

## Properties

### features

> **features**: `string`[]

Global wallet features that must be available.
These represent wallet-level functionalities beyond specific blockchain support,
such as hardware security, multi-account support, or session management.
See RESPONDER_FEATURES for standard values.

***

### networks?

> `optional` **networks**: `string`[]

Specific networks required (CAIP-2 format).
Examples: 'eip155:1' (Ethereum mainnet), 'aztec:31337' (Aztec sandbox), 'solana:mainnet'
If specified, wallet must support at least one of these networks to match.
Networks are independent of technology support - a wallet might support Aztec technology
on multiple networks.

***

### technologies

> **technologies**: `TechnologyRequirement`[]

Blockchain technologies that must be supported.
Each technology includes its required interfaces and features.
Wallets must support at least the interfaces listed for each technology.
