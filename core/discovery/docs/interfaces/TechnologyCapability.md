[**@walletmesh/discovery v0.1.3**](../README.md)

***

[@walletmesh/discovery](../globals.md) / TechnologyCapability

# Interface: TechnologyCapability

Defined in: [core/discovery/src/types/capabilities.ts:138](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/capabilities.ts#L138)

Technology capability declaration for responders.

Describes a blockchain technology supported by a responder, including
all interfaces and features available for that technology.

## Since

0.3.0

## Properties

### features?

> `optional` **features**: `string`[]

Defined in: [core/discovery/src/types/capabilities.ts:154](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/capabilities.ts#L154)

All technology-specific features supported.
Should include all capabilities specific to this blockchain technology.

***

### interfaces

> **interfaces**: `string`[]

Defined in: [core/discovery/src/types/capabilities.ts:148](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/capabilities.ts#L148)

All provider interfaces supported for this technology.
Responders should list all interfaces they implement.

***

### type

> **type**: `string`

Defined in: [core/discovery/src/types/capabilities.ts:142](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/capabilities.ts#L142)

Blockchain technology type.
