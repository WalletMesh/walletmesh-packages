[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / CapabilityPreferences

# Interface: CapabilityPreferences

Optional capability preferences for enhanced responder matching.

While CapabilityRequirements define what a wallet MUST support,
preferences indicate what would be nice to have. These help rank
and prioritize wallets that go beyond the minimum requirements.

## Since

0.1.0

## Properties

### features?

> `optional` **features**: `string`[]

Additional wallet features that would enhance the user experience.
These are "nice to have" capabilities beyond the required features.

***

### networks?

> `optional` **networks**: `string`[]

Additional networks that would be beneficial (CAIP-2 format).
These networks are not required but having them increases wallet ranking.

***

### technologies?

> `optional` **technologies**: `TechnologyRequirement`[]

Additional technology capabilities that would be beneficial.
These technologies are not required but having them increases wallet ranking.
