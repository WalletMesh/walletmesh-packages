[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / HeadlessModalState

# Interface: HeadlessModalState

Headless modal state that provides semantic data only

## Properties

### connection

> **connection**: [`ConnectionDisplayData`](ConnectionDisplayData.md)

Current connection state

***

### isOpen

> **isOpen**: `boolean`

Whether the modal is open/visible (for framework adapters to use)

***

### selectedWalletId?

> `optional` **selectedWalletId**: `string`

Currently selected wallet ID

***

### wallets

> **wallets**: [`WalletDisplayData`](WalletDisplayData.md)[]

Available wallets with semantic information
