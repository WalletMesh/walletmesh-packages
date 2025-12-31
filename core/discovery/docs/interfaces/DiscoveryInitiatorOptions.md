[**@walletmesh/discovery v0.1.3**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryInitiatorOptions

# Interface: DiscoveryInitiatorOptions

Defined in: [core/discovery/src/initiator.ts:63](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/initiator.ts#L63)

Options for DiscoveryInitiator configuration.

## Since

0.1.0

## Properties

### eventTarget?

> `optional` **eventTarget**: `EventTarget`

Defined in: [core/discovery/src/initiator.ts:69](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/initiator.ts#L69)

Custom event target for testing

***

### logger?

> `optional` **logger**: [`Logger`](Logger.md)

Defined in: [core/discovery/src/initiator.ts:71](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/initiator.ts#L71)

Custom logger instance

***

### security?

> `optional` **security**: [`SecurityPolicy`](SecurityPolicy.md) \| `"development"` \| `"testing"` \| `"production"` \| `"strict"`

Defined in: [core/discovery/src/initiator.ts:65](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/initiator.ts#L65)

Security policy preset name or custom policy

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [core/discovery/src/initiator.ts:67](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/initiator.ts#L67)

Discovery timeout in milliseconds
