[**@walletmesh/discovery v0.1.3**](../README.md)

***

[@walletmesh/discovery](../globals.md) / CapabilityIntersection

# Interface: CapabilityIntersection

Defined in: [core/discovery/src/types/capabilities.ts:167](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/capabilities.ts#L167)

Result of capability intersection between requirements and responder capabilities.

Contains the overlapping capabilities between what the initiator requested
and what the responder supports. Only includes capabilities that match both
requirements and responder capabilities.

## Since

0.1.0

## Properties

### optional?

> `optional` **optional**: `object`

Defined in: [core/discovery/src/types/capabilities.ts:194](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/capabilities.ts#L194)

The intersection of optional/preferred capabilities.
These were requested as nice-to-have and are supported by the wallet.

#### features?

> `optional` **features**: `string`[]

Optional features that are supported.

#### networks?

> `optional` **networks**: `string`[]

Optional networks that are supported (CAIP-2 format).

#### technologies?

> `optional` **technologies**: [`TechnologyMatch`](TechnologyMatch.md)[]

Optional technology matches.

***

### required

> **required**: `object`

Defined in: [core/discovery/src/types/capabilities.ts:172](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/capabilities.ts#L172)

The intersection of required capabilities.
All of these were requested as mandatory and are supported by the wallet.

#### features

> **features**: `string`[]

Global features that overlap between requirements and responder support.

#### networks?

> `optional` **networks**: `string`[]

Networks that overlap between requirements and responder support (CAIP-2 format).
Only included if networks were specified in the request.

#### technologies

> **technologies**: [`TechnologyMatch`](TechnologyMatch.md)[]

Matched blockchain technologies with their supported interfaces/features.
