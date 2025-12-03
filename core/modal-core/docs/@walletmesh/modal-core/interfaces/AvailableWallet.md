[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / AvailableWallet

# Interface: AvailableWallet

Result of wallet detection, including availability status.

## Properties

### adapter

> **adapter**: [`WalletAdapter`](WalletAdapter.md)

The wallet adapter instance.

***

### available

> **available**: `boolean`

Whether the wallet is currently available (installed/accessible).

***

### customData?

> `optional` **customData**: `Record`\<`string`, `unknown`\>

Additional wallet-specific metadata.

***

### version?

> `optional` **version**: `string`

Optional version string of the detected wallet.
