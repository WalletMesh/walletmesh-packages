[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ConnectionRecoveryOptions

# Interface: ConnectionRecoveryOptions

Connection recovery options

## Properties

### autoReconnect?

> `optional` **autoReconnect**: `boolean`

Whether to enable auto-reconnection

***

### maxReconnectAttempts?

> `optional` **maxReconnectAttempts**: `number`

Maximum number of reconnection attempts

***

### persistSession?

> `optional` **persistSession**: `boolean`

Whether to persist session across page reloads

***

### reconnectInterval?

> `optional` **reconnectInterval**: `number`

Interval between reconnection attempts

***

### recoveryStrategy?

> `optional` **recoveryStrategy**: `"immediate"` \| `"exponential-backoff"` \| `"linear-backoff"`

Custom recovery strategy
