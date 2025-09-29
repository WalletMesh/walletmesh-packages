[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DiscoveryProtocolEvent

# Type Alias: DiscoveryProtocolEvent

> **DiscoveryProtocolEvent** = \{ `sessionId?`: `string`; `timestamp`: `number`; `type`: `"discovery_started"`; \} \| \{ `found`: `number`; `progress`: `number`; `sessionId?`: `string`; `type`: `"discovery_progress"`; \} \| \{ `sessionId`: `string`; `timestamp`: `number`; `type`: `"wallet_found"`; `wallet`: [`QualifiedWallet`](../interfaces/QualifiedWallet.md); \} \| \{ `duration`: `number`; `sessionId?`: `string`; `type`: `"discovery_completed"`; `wallets`: [`QualifiedWallet`](../interfaces/QualifiedWallet.md)[]; \} \| \{ `partialResults`: [`QualifiedWallet`](../interfaces/QualifiedWallet.md)[]; `sessionId?`: `string`; `type`: `"discovery_timeout"`; \} \| \{ `error`: `Error`; `recoverable`: `boolean`; `sessionId?`: `string`; `type`: `"discovery_error"`; \} \| \{ `sessionId?`: `string`; `type`: `"connection_requested"`; `walletId`: `string`; \} \| \{ `sessionId`: `string`; `type`: `"connection_established"`; `walletId`: `string`; \} \| \{ `error`: `Error`; `sessionId?`: `string`; `type`: `"connection_failed"`; `walletId`: `string`; \}

Discovery protocol events
