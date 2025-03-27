[**@walletmesh/modal-core v0.0.1**](../README.md)

***

[@walletmesh/modal-core](../globals.md) / WalletSession

# Interface: WalletSession

Defined in: [types.ts:95](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/types.ts#L95)

Wallet session information

## Properties

### address

> **address**: `string`

Defined in: [types.ts:99](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/types.ts#L99)

Connected wallet address

***

### chains

> **chains**: `Record`\<`number`, `ChainConnection`\>

Defined in: [types.ts:101](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/types.ts#L101)

Chain connections

***

### connector

> **connector**: [`Connector`](Connector.md)

Defined in: [types.ts:107](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/types.ts#L107)

Active connector

***

### expiry

> **expiry**: `number`

Defined in: [types.ts:103](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/types.ts#L103)

Session expiry timestamp

***

### id

> **id**: `string`

Defined in: [types.ts:97](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/types.ts#L97)

Session ID

***

### status

> **status**: [`ConnectionState`](../enumerations/ConnectionState.md)

Defined in: [types.ts:105](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/types.ts#L105)

Connection status

***

### wallet

> **wallet**: [`ConnectedWallet`](ConnectedWallet.md)

Defined in: [types.ts:109](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/types.ts#L109)

Connected wallet
