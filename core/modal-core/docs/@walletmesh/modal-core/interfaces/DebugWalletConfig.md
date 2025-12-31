[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DebugWalletConfig

# Interface: DebugWalletConfig

Configuration for test wallet behavior

## Properties

### available?

> `optional` **available**: `boolean`

Whether the wallet is available

***

### chains?

> `optional` **chains**: [`ChainType`](../enumerations/ChainType.md)[]

Supported chain types

***

### connectionDelay?

> `optional` **connectionDelay**: `number`

Connection delay in ms (for testing)

***

### fixedAccounts?

> `optional` **fixedAccounts**: `string`[]

Fixed accounts to return

***

### rejectionRate?

> `optional` **rejectionRate**: `number`

Rejection rate (0-1) for testing error scenarios
