[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletClientSetup

# Interface: WalletClientSetup

Configuration for creating a complete wallet client setup

## Properties

### client

> **client**: [`WalletMeshConfig`](WalletMeshConfig.md)

Client configuration

***

### connectionRecovery?

> `optional` **connectionRecovery**: [`ConnectionRecoveryOptions`](ConnectionRecoveryOptions.md)

Connection recovery options

***

### discovery?

> `optional` **discovery**: [`DiscoveryConfig`](DiscoveryConfig.md) & `object`

Discovery service configuration

#### Type Declaration

##### customChains?

> `optional` **customChains**: `string`[]

Custom chain IDs for discovery (overrides chain type mappings)

***

### events?

> `optional` **events**: [`EventSystemConfig`](EventSystemConfig.md)

Event system configuration

***

### options?

> `optional` **options**: [`CreateWalletMeshClientOptions`](CreateWalletMeshClientOptions.md)

Creation options
