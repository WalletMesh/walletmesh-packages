[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DiscoveryResponseEvent

# Interface: DiscoveryResponseEvent

Discovery response event sent by qualified responders.

## Since

0.1.0

## Extends

- `BaseDiscoveryMessage`

## Properties

### description?

> `optional` **description**: `string`

***

### icon

> **icon**: `string`

***

### matched

> **matched**: `CapabilityIntersection`

***

### name

> **name**: `string`

***

### networks?

> `optional` **networks**: `string`[]

***

### rdns

> **rdns**: `string`

***

### responderId

> **responderId**: `string`

***

### responderVersion?

> `optional` **responderVersion**: `string`

***

### sessionId

> **sessionId**: `string`

#### Inherited from

`BaseDiscoveryMessage.sessionId`

***

### transportConfig?

> `optional` **transportConfig**: `TransportConfig`

***

### type

> **type**: `"discovery:wallet:response"`

#### Overrides

`BaseDiscoveryMessage.type`

***

### version

> **version**: `"0.1.0"`

#### Inherited from

`BaseDiscoveryMessage.version`
