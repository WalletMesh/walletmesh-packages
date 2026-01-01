[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DiscoveryConnectionState

# Interface: DiscoveryConnectionState

Connection state information

## Properties

### connectedAt?

> `optional` **connectedAt**: `number`

Connection timestamp

***

### error?

> `optional` **error**: `object`

Error information if status is 'error'

#### code

> **code**: `string`

#### message

> **message**: `string`

#### recoverable

> **recoverable**: `boolean`

***

### lastActivity?

> `optional` **lastActivity**: `number`

Last activity timestamp

***

### qualifiedWallet?

> `optional` **qualifiedWallet**: [`QualifiedWallet`](QualifiedWallet.md)

Original qualified wallet data

***

### sessionId?

> `optional` **sessionId**: `string`

Session ID if connected

***

### status

> **status**: `"disconnected"` \| `"connecting"` \| `"connected"` \| `"error"`

Connection status

***

### transport?

> `optional` **transport**: `object`

Transport configuration

#### config

> **config**: `Record`\<`string`, `unknown`\>

#### type

> **type**: `string`

***

### walletId

> **walletId**: `string`

Wallet ID
