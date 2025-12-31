[**@walletmesh/discovery v0.1.3**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryCompleteEvent

# Interface: DiscoveryCompleteEvent

Defined in: [core/discovery/src/types/core.ts:86](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/core.ts#L86)

Discovery completion event sent when discovery session ends.

## Since

0.1.0

## Extends

- [`BaseDiscoveryMessage`](BaseDiscoveryMessage.md)

## Properties

### reason

> **reason**: `"timeout"` \| `"manual-stop"` \| `"max-responders"`

Defined in: [core/discovery/src/types/core.ts:88](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/core.ts#L88)

***

### respondersFound

> **respondersFound**: `number`

Defined in: [core/discovery/src/types/core.ts:89](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/core.ts#L89)

***

### sessionId

> **sessionId**: `string`

Defined in: [core/discovery/src/types/core.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/core.ts#L27)

#### Inherited from

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`sessionId`](BaseDiscoveryMessage.md#sessionid)

***

### type

> **type**: `"discovery:wallet:complete"`

Defined in: [core/discovery/src/types/core.ts:87](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/core.ts#L87)

#### Overrides

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`type`](BaseDiscoveryMessage.md#type)

***

### version

> **version**: `"0.1.0"`

Defined in: [core/discovery/src/types/core.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/core.ts#L26)

#### Inherited from

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`version`](BaseDiscoveryMessage.md#version)
