[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ConnectionEvent

# Type Alias: ConnectionEvent

> **ConnectionEvent** = \{ `type`: `"connecting"`; `walletId`: `string`; \} \| \{ `connection`: [`WalletConnection`](../interfaces/WalletConnection.md); `type`: `"connected"`; `walletId`: `string`; \} \| \{ `type`: `"disconnecting"`; `walletId`: `string`; \} \| \{ `reason?`: `string`; `type`: `"disconnected"`; `walletId`: `string`; \} \| \{ `error`: `Error`; `type`: `"error"`; `walletId`: `string`; \} \| \{ `attempt`: `number`; `type`: `"recovery_started"`; `walletId`: `string`; \} \| \{ `error`: `Error`; `type`: `"recovery_failed"`; `walletId`: `string`; \} \| \{ `connection`: [`WalletConnection`](../interfaces/WalletConnection.md); `type`: `"recovery_succeeded"`; `walletId`: `string`; \}

Connection event types
