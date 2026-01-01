[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ConnectionState

# Interface: ConnectionState

Connection state information

## Properties

### attempts

> **attempts**: `number`

Connection attempt count

***

### autoReconnect

> **autoReconnect**: `boolean`

Whether auto-reconnect is enabled

***

### error?

> `optional` **error**: `Error`

Connection error if any

***

### lastAttempt

> **lastAttempt**: `number`

Last connection attempt timestamp

***

### lastConnected

> **lastConnected**: `number`

Last successful connection timestamp

***

### maxReconnectAttempts

> **maxReconnectAttempts**: `number`

Maximum reconnection attempts

***

### reconnectInterval

> **reconnectInterval**: `number`

Reconnection interval in milliseconds

***

### status

> **status**: `"disconnected"` \| `"connecting"` \| `"connected"` \| `"error"` \| `"disconnecting"` \| `"idle"`

Connection status

***

### walletId

> **walletId**: `string`

Wallet ID
