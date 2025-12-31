[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ConnectionStateMachine

# Type Alias: ConnectionStateMachine

> **ConnectionStateMachine** = \{ `status`: `"disconnected"`; `walletId`: `string`; \} \| \{ `startedAt`: `number`; `status`: `"connecting"`; `walletId`: `string`; \} \| \{ `address`: `string`; `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `connectedAt`: `number`; `status`: `"connected"`; `walletId`: `string`; \} \| \{ `error`: `Error`; `occurredAt`: `number`; `status`: `"error"`; `walletId`: `string`; \} \| \{ `attempt`: `number`; `lastAddress`: `string`; `nextRetryAt`: `number`; `status`: `"reconnecting"`; `walletId`: `string`; \}

Connection state machine using discriminated unions

This type is designed for state management patterns where each status
has different available fields. For a simple object-based connection state,
use WalletConnectionState from api/types/connection.ts instead.

## See

WalletConnectionState - Object-based connection state for general use
