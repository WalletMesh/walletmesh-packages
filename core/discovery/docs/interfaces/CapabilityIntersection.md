[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / CapabilityIntersection

# Interface: CapabilityIntersection

Defined in: [core/discovery/src/types/capabilities.ts:163](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/types/capabilities.ts#L163)

Result of capability intersection between requirements and responder capabilities.

Contains the overlapping capabilities between what the initiator requested
and what the responder supports. Only includes capabilities that match both
requirements and responder capabilities.

## Since

0.1.0

## Properties

### optional?

> `optional` **optional**: `object`

Defined in: [core/discovery/src/types/capabilities.ts:184](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/types/capabilities.ts#L184)

The intersection of optional/preferred capabilities.
These were requested as nice-to-have and are supported by the wallet.

#### features?

> `optional` **features**: `string`[]

Optional features that are supported.

#### technologies?

> `optional` **technologies**: [`TechnologyMatch`](TechnologyMatch.md)[]

Optional technology matches.

***

### required

> **required**: `object`

Defined in: [core/discovery/src/types/capabilities.ts:168](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/types/capabilities.ts#L168)

The intersection of required capabilities.
All of these were requested as mandatory and are supported by the wallet.

#### features

> **features**: `string`[]

Global features that overlap between requirements and responder support.

#### technologies

> **technologies**: [`TechnologyMatch`](TechnologyMatch.md)[]

Matched blockchain technologies with their supported interfaces/features.
