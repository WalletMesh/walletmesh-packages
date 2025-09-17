[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / CapabilityPreferences

# Interface: CapabilityPreferences

Defined in: [core/discovery/src/types/capabilities.ts:83](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/types/capabilities.ts#L83)

Optional capability preferences for enhanced responder matching.

While CapabilityRequirements define what a wallet MUST support,
preferences indicate what would be nice to have. These help rank
and prioritize wallets that go beyond the minimum requirements.

## Since

0.1.0

## Properties

### features?

> `optional` **features**: `string`[]

Defined in: [core/discovery/src/types/capabilities.ts:94](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/types/capabilities.ts#L94)

Additional wallet features that would enhance the user experience.
These are "nice to have" capabilities beyond the required features.

***

### technologies?

> `optional` **technologies**: [`TechnologyRequirement`](TechnologyRequirement.md)[]

Defined in: [core/discovery/src/types/capabilities.ts:88](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/types/capabilities.ts#L88)

Additional technology capabilities that would be beneficial.
These technologies are not required but having them increases wallet ranking.
