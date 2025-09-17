[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryInitiatorOptions

# Interface: DiscoveryInitiatorOptions

Defined in: [core/discovery/src/initiator.ts:40](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/initiator.ts#L40)

Options for DiscoveryInitiator configuration.

## Since

0.1.0

## Properties

### eventTarget?

> `optional` **eventTarget**: `EventTarget`

Defined in: [core/discovery/src/initiator.ts:46](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/initiator.ts#L46)

Custom event target for testing

***

### logger?

> `optional` **logger**: [`Logger`](Logger.md)

Defined in: [core/discovery/src/initiator.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/initiator.ts#L48)

Custom logger instance

***

### security?

> `optional` **security**: `string` \| [`SecurityPolicy`](SecurityPolicy.md)

Defined in: [core/discovery/src/initiator.ts:42](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/initiator.ts#L42)

Security policy preset name or custom policy

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [core/discovery/src/initiator.ts:44](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/initiator.ts#L44)

Discovery timeout in milliseconds
