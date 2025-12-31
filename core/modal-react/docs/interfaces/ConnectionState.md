[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ConnectionState

# Interface: ConnectionState

Defined in: core/modal-core/dist/client/ConnectionManager.d.ts:23

Connection state information

## Properties

### attempts

> **attempts**: `number`

Defined in: core/modal-core/dist/client/ConnectionManager.d.ts:29

Connection attempt count

***

### autoReconnect

> **autoReconnect**: `boolean`

Defined in: core/modal-core/dist/client/ConnectionManager.d.ts:37

Whether auto-reconnect is enabled

***

### error?

> `optional` **error**: `Error`

Defined in: core/modal-core/dist/client/ConnectionManager.d.ts:35

Connection error if any

***

### lastAttempt

> **lastAttempt**: `number`

Defined in: core/modal-core/dist/client/ConnectionManager.d.ts:31

Last connection attempt timestamp

***

### lastConnected

> **lastConnected**: `number`

Defined in: core/modal-core/dist/client/ConnectionManager.d.ts:33

Last successful connection timestamp

***

### maxReconnectAttempts

> **maxReconnectAttempts**: `number`

Defined in: core/modal-core/dist/client/ConnectionManager.d.ts:41

Maximum reconnection attempts

***

### reconnectInterval

> **reconnectInterval**: `number`

Defined in: core/modal-core/dist/client/ConnectionManager.d.ts:39

Reconnection interval in milliseconds

***

### status

> **status**: `"connecting"` \| `"connected"` \| `"error"` \| `"disconnected"` \| `"idle"` \| `"disconnecting"`

Defined in: core/modal-core/dist/client/ConnectionManager.d.ts:27

Connection status

***

### walletId

> **walletId**: `string`

Defined in: core/modal-core/dist/client/ConnectionManager.d.ts:25

Wallet ID
