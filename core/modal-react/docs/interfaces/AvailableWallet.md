[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AvailableWallet

# Interface: AvailableWallet

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:643

Result of wallet detection, including availability status.

## Properties

### adapter

> **adapter**: [`WalletAdapter`](WalletAdapter.md)

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:647

The wallet adapter instance.

***

### available

> **available**: `boolean`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:651

Whether the wallet is currently available (installed/accessible).

***

### customData?

> `optional` **customData**: `Record`\<`string`, `unknown`\>

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:659

Additional wallet-specific metadata.

***

### version?

> `optional` **version**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:655

Optional version string of the detected wallet.
