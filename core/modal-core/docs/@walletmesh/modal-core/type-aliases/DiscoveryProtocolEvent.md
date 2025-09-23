[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DiscoveryProtocolEvent

# Type Alias: DiscoveryProtocolEvent

> **DiscoveryProtocolEvent** = \{ `timestamp`: `number`; `type`: `"discovery_started"`; \} \| \{ `found`: `number`; `progress`: `number`; `type`: `"discovery_progress"`; \} \| \{ `timestamp`: `number`; `type`: `"wallet_found"`; `wallet`: [`QualifiedWallet`](../interfaces/QualifiedWallet.md); \} \| \{ `duration`: `number`; `type`: `"discovery_completed"`; `wallets`: [`QualifiedWallet`](../interfaces/QualifiedWallet.md)[]; \} \| \{ `partialResults`: [`QualifiedWallet`](../interfaces/QualifiedWallet.md)[]; `type`: `"discovery_timeout"`; \} \| \{ `error`: `Error`; `recoverable`: `boolean`; `type`: `"discovery_error"`; \} \| \{ `type`: `"connection_requested"`; `walletId`: `string`; \} \| \{ `sessionId`: `string`; `type`: `"connection_established"`; `walletId`: `string`; \} \| \{ `error`: `Error`; `type`: `"connection_failed"`; `walletId`: `string`; \}

Discovery protocol events
