[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AvailableWallet

# Interface: AvailableWallet

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:111

Wallet detection result with availability information

## Properties

### adapter

> **adapter**: [`WalletAdapter`](WalletAdapter.md)

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:113

The wallet adapter instance

***

### available

> **available**: `boolean`

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:115

Whether the wallet is currently available

***

### customData?

> `optional` **customData**: `Record`\<`string`, `unknown`\>

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:119

Additional metadata

***

### version?

> `optional` **version**: `string`

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:117

Optional version information
