[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / DebugWalletConfig

# Interface: DebugWalletConfig

Defined in: core/modal-core/dist/internal/wallets/debug/DebugWallet.d.ts:23

Configuration for test wallet behavior

## Properties

### available?

> `optional` **available**: `boolean`

Defined in: core/modal-core/dist/internal/wallets/debug/DebugWallet.d.ts:33

Whether the wallet is available

***

### chains?

> `optional` **chains**: [`ChainType`](../enumerations/ChainType.md)[]

Defined in: core/modal-core/dist/internal/wallets/debug/DebugWallet.d.ts:25

Supported chain types

***

### connectionDelay?

> `optional` **connectionDelay**: `number`

Defined in: core/modal-core/dist/internal/wallets/debug/DebugWallet.d.ts:27

Connection delay in ms (for testing)

***

### fixedAccounts?

> `optional` **fixedAccounts**: `string`[]

Defined in: core/modal-core/dist/internal/wallets/debug/DebugWallet.d.ts:31

Fixed accounts to return

***

### rejectionRate?

> `optional` **rejectionRate**: `number`

Defined in: core/modal-core/dist/internal/wallets/debug/DebugWallet.d.ts:29

Rejection rate (0-1) for testing error scenarios
