[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / TechnologyCapability

# Interface: TechnologyCapability

Defined in: [core/discovery/src/types/capabilities.ts:134](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/types/capabilities.ts#L134)

Technology capability declaration for responders.

Describes a blockchain technology supported by a responder, including
all interfaces and features available for that technology.

## Since

0.3.0

## Properties

### features?

> `optional` **features**: `string`[]

Defined in: [core/discovery/src/types/capabilities.ts:150](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/types/capabilities.ts#L150)

All technology-specific features supported.
Should include all capabilities specific to this blockchain technology.

***

### interfaces

> **interfaces**: `string`[]

Defined in: [core/discovery/src/types/capabilities.ts:144](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/types/capabilities.ts#L144)

All provider interfaces supported for this technology.
Responders should list all interfaces they implement.

***

### type

> **type**: `string`

Defined in: [core/discovery/src/types/capabilities.ts:138](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/types/capabilities.ts#L138)

Blockchain technology type.
