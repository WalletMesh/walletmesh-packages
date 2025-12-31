[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / CreateWalletMeshClientOptions

# Interface: CreateWalletMeshClientOptions

Options for creating a WalletMeshClient

## Properties

### autoInitialize?

> `optional` **autoInitialize**: `boolean`

Whether to automatically call initialize() after creation (default: false for sync compatibility)

***

### logger?

> `optional` **logger**: [`Logger`](../classes/Logger.md)

Custom logger instance to use

***

### modal?

> `optional` **modal**: [`ModalController`](ModalController.md)

Custom modal controller to use

***

### registerBuiltinAdapters?

> `optional` **registerBuiltinAdapters**: `boolean`

Whether to register built-in adapters

***

### registry?

> `optional` **registry**: [`WalletRegistry`](../classes/WalletRegistry.md)

Custom registry instance to use

***

### ssr?

> `optional` **ssr**: `boolean`

Whether to force SSR mode
