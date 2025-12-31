[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / DiscoveryEvent

# Type Alias: DiscoveryEvent

> **DiscoveryEvent** = \{ `type`: `"discovery_started"`; \} \| \{ `type`: `"discovery_completed"`; `wallets`: [`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)[]; \} \| \{ `type`: `"wallet_discovered"`; `wallet`: [`DiscoveredWallet`](../interfaces/DiscoveredWallet.md); \} \| \{ `type`: `"wallet_available"`; `wallet`: [`DiscoveredWallet`](../interfaces/DiscoveredWallet.md); \} \| \{ `type`: `"wallet_unavailable"`; `walletId`: `string`; \} \| \{ `error`: `Error`; `type`: `"discovery_error"`; \} \| \{ `targetOrigin`: `string`; `type`: `"announcement_sent"`; \} \| \{ `origin`: `string`; `type`: `"announcement_received"`; `wallet`: [`DiscoveredWallet`](../interfaces/DiscoveredWallet.md); \}

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:117

Enhanced discovery event types
Combines standard discovery events with transport-specific events
