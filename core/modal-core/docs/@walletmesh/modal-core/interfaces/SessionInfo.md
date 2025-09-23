[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / SessionInfo

# Interface: SessionInfo

Session information

## Properties

### account?

> `optional` **account**: `string`

Connected account address

***

### chainId?

> `optional` **chainId**: `string`

Connected chain ID

***

### createdAt

> **createdAt**: `number`

Session creation timestamp

***

### id

> **id**: `string`

Unique session identifier

***

### lastActivityAt

> **lastActivityAt**: `number`

Last activity timestamp

***

### metadata?

> `optional` **metadata**: [`SessionMetadata`](SessionMetadata.md)

Session metadata

***

### status

> **status**: [`ConnectionStatus`](../enumerations/ConnectionStatus.md)

Connection status

***

### walletId

> **walletId**: `string`

Wallet ID associated with the session
