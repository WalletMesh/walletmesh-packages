[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ConnectionStateChangeEvent

# Interface: ConnectionStateChangeEvent

Connection state change event data

## Properties

### currentState?

> `optional` **currentState**: [`WalletConnection`](WalletConnection.md)

New connection state

***

### error?

> `optional` **error**: `Error`

Error information if applicable

***

### previousState?

> `optional` **previousState**: [`WalletConnection`](WalletConnection.md)

Previous connection state

***

### type

> **type**: `"disconnected"` \| `"connecting"` \| `"connected"` \| `"error"`

Type of state change

***

### walletId

> **walletId**: `string`

Wallet ID that triggered the change
