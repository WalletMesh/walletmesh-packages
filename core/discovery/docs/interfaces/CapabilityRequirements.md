[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / CapabilityRequirements

# Interface: CapabilityRequirements

Defined in: [core/discovery/src/types/capabilities.ts:56](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L56)

Capability requirements specification for responder discovery.

Capabilities represent the complete set of functionalities a wallet can provide,
organized into technology-based requirements and global features.

## Since

0.1.0

## Properties

### features

> **features**: `string`[]

Defined in: [core/discovery/src/types/capabilities.ts:70](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L70)

Global wallet features that must be available.
These represent wallet-level functionalities beyond specific blockchain support,
such as hardware security, multi-account support, or session management.
See RESPONDER_FEATURES for standard values.

***

### technologies

> **technologies**: [`TechnologyRequirement`](TechnologyRequirement.md)[]

Defined in: [core/discovery/src/types/capabilities.ts:62](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L62)

Blockchain technologies that must be supported.
Each technology includes its required interfaces and features.
Wallets must support at least the interfaces listed for each technology.
