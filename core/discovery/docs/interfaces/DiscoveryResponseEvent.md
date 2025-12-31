[**@walletmesh/discovery v0.1.4**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryResponseEvent

# Interface: DiscoveryResponseEvent

Defined in: [core/discovery/src/types/core.ts:67](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/core.ts#L67)

Discovery response event sent by qualified responders.

## Since

0.1.0

## Extends

- [`BaseDiscoveryMessage`](BaseDiscoveryMessage.md)

## Properties

### description?

> `optional` **description**: `string`

Defined in: [core/discovery/src/types/core.ts:76](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/core.ts#L76)

***

### icon

> **icon**: `string`

Defined in: [core/discovery/src/types/core.ts:72](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/core.ts#L72)

***

### matched

> **matched**: [`CapabilityIntersection`](CapabilityIntersection.md)

Defined in: [core/discovery/src/types/core.ts:73](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/core.ts#L73)

***

### name

> **name**: `string`

Defined in: [core/discovery/src/types/core.ts:71](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/core.ts#L71)

***

### networks?

> `optional` **networks**: `string`[]

Defined in: [core/discovery/src/types/core.ts:74](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/core.ts#L74)

***

### rdns

> **rdns**: `string`

Defined in: [core/discovery/src/types/core.ts:70](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/core.ts#L70)

***

### responderId

> **responderId**: `string`

Defined in: [core/discovery/src/types/core.ts:69](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/core.ts#L69)

***

### responderVersion?

> `optional` **responderVersion**: `string`

Defined in: [core/discovery/src/types/core.ts:77](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/core.ts#L77)

***

### sessionId

> **sessionId**: `string`

Defined in: [core/discovery/src/types/core.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/core.ts#L27)

#### Inherited from

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`sessionId`](BaseDiscoveryMessage.md#sessionid)

***

### transportConfig?

> `optional` **transportConfig**: [`TransportConfig`](TransportConfig.md)

Defined in: [core/discovery/src/types/core.ts:75](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/core.ts#L75)

***

### type

> **type**: `"discovery:wallet:response"`

Defined in: [core/discovery/src/types/core.ts:68](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/core.ts#L68)

#### Overrides

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`type`](BaseDiscoveryMessage.md#type)

***

### version

> **version**: `"0.1.0"`

Defined in: [core/discovery/src/types/core.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/core.ts#L26)

#### Inherited from

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`version`](BaseDiscoveryMessage.md#version)
