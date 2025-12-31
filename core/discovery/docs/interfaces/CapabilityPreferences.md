[**@walletmesh/discovery v0.1.4**](../README.md)

***

[@walletmesh/discovery](../globals.md) / CapabilityPreferences

# Interface: CapabilityPreferences

Defined in: [core/discovery/src/types/capabilities.ts:90](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/capabilities.ts#L90)

Optional capability preferences for enhanced responder matching.

While CapabilityRequirements define what a wallet MUST support,
preferences indicate what would be nice to have. These help rank
and prioritize wallets that go beyond the minimum requirements.

## Since

0.1.0

## Properties

### features?

> `optional` **features**: `string`[]

Defined in: [core/discovery/src/types/capabilities.ts:101](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/capabilities.ts#L101)

Additional wallet features that would enhance the user experience.
These are "nice to have" capabilities beyond the required features.

***

### networks?

> `optional` **networks**: `string`[]

Defined in: [core/discovery/src/types/capabilities.ts:107](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/capabilities.ts#L107)

Additional networks that would be beneficial (CAIP-2 format).
These networks are not required but having them increases wallet ranking.

***

### technologies?

> `optional` **technologies**: [`TechnologyRequirement`](TechnologyRequirement.md)[]

Defined in: [core/discovery/src/types/capabilities.ts:95](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/capabilities.ts#L95)

Additional technology capabilities that would be beneficial.
These technologies are not required but having them increases wallet ranking.
