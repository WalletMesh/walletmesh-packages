[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / EnhancedDiscoveryEvent

# Type Alias: EnhancedDiscoveryEvent

> **EnhancedDiscoveryEvent** = \{ `type`: `"wallet_discovered_with_transport"`; `wallet`: [`QualifiedWallet`](../interfaces/QualifiedWallet.md); \} \| \{ `type`: `"wallet_registered"`; `walletId`: `string`; `walletName`: `string`; \} \| \{ `transportType`: `string`; `type`: `"transport_extracted"`; `walletId`: `string`; \}

Enhanced discovery event types from transport layer
