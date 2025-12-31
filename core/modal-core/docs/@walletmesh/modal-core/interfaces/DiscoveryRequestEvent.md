[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DiscoveryRequestEvent

# Interface: DiscoveryRequestEvent

Discovery request event sent by initiators to find responders.

## Since

0.1.0

## Extends

- `BaseDiscoveryMessage`

## Properties

### initiatorInfo

> **initiatorInfo**: [`DAppInfo`](DAppInfo.md)

***

### optional?

> `optional` **optional**: [`CapabilityPreferences`](CapabilityPreferences.md)

***

### origin

> **origin**: `string`

***

### required

> **required**: [`CapabilityRequirements`](CapabilityRequirements.md)

***

### sessionId

> **sessionId**: `string`

#### Inherited from

`BaseDiscoveryMessage.sessionId`

***

### type

> **type**: `"discovery:wallet:request"`

#### Overrides

`BaseDiscoveryMessage.type`

***

### version

> **version**: `"0.1.0"`

#### Inherited from

`BaseDiscoveryMessage.version`
