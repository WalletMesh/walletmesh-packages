[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryCompleteEvent

# Interface: DiscoveryCompleteEvent

Defined in: [core/discovery/src/types/core.ts:85](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/core.ts#L85)

Discovery completion event sent when discovery session ends.

## Since

0.1.0

## Extends

- [`BaseDiscoveryMessage`](BaseDiscoveryMessage.md)

## Properties

### reason

> **reason**: `"timeout"` \| `"manual-stop"` \| `"max-responders"`

Defined in: [core/discovery/src/types/core.ts:87](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/core.ts#L87)

***

### respondersFound

> **respondersFound**: `number`

Defined in: [core/discovery/src/types/core.ts:88](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/core.ts#L88)

***

### sessionId

> **sessionId**: `string`

Defined in: [core/discovery/src/types/core.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/core.ts#L27)

#### Inherited from

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`sessionId`](BaseDiscoveryMessage.md#sessionid)

***

### type

> **type**: `"discovery:wallet:complete"`

Defined in: [core/discovery/src/types/core.ts:86](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/core.ts#L86)

#### Overrides

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`type`](BaseDiscoveryMessage.md#type)

***

### version

> **version**: `"0.1.0"`

Defined in: [core/discovery/src/types/core.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/core.ts#L26)

#### Inherited from

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`version`](BaseDiscoveryMessage.md#version)
