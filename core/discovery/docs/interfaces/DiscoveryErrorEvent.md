[**@walletmesh/discovery v0.1.3**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryErrorEvent

# Interface: DiscoveryErrorEvent

Defined in: [core/discovery/src/types/core.ts:98](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/core.ts#L98)

Discovery error event sent when discovery session fails.

## Since

0.1.0

## Extends

- [`BaseDiscoveryMessage`](BaseDiscoveryMessage.md)

## Properties

### errorCategory

> **errorCategory**: [`ErrorCategory`](../type-aliases/ErrorCategory.md)

Defined in: [core/discovery/src/types/core.ts:102](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/core.ts#L102)

***

### errorCode

> **errorCode**: `number`

Defined in: [core/discovery/src/types/core.ts:100](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/core.ts#L100)

***

### errorMessage

> **errorMessage**: `string`

Defined in: [core/discovery/src/types/core.ts:101](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/core.ts#L101)

***

### sessionId

> **sessionId**: `string`

Defined in: [core/discovery/src/types/core.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/core.ts#L27)

#### Inherited from

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`sessionId`](BaseDiscoveryMessage.md#sessionid)

***

### type

> **type**: `"discovery:wallet:error"`

Defined in: [core/discovery/src/types/core.ts:99](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/core.ts#L99)

#### Overrides

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`type`](BaseDiscoveryMessage.md#type)

***

### version

> **version**: `"0.1.0"`

Defined in: [core/discovery/src/types/core.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/core.ts#L26)

#### Inherited from

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`version`](BaseDiscoveryMessage.md#version)
