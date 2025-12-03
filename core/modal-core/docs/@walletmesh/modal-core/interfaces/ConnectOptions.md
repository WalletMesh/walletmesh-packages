[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ConnectOptions

# Interface: ConnectOptions

Connection options

## Extends

- [`ConnectArgs`](ConnectArgs.md)

## Properties

### autoRetry?

> `optional` **autoRetry**: `boolean`

Auto-retry on failure

***

### chainId?

> `optional` **chainId**: `string`

Chain ID to connect to

#### Inherited from

[`ConnectArgs`](ConnectArgs.md).[`chainId`](ConnectArgs.md#chainid)

***

### chainType?

> `optional` **chainType**: [`ChainType`](../enumerations/ChainType.md)

Chain type to connect to

#### Inherited from

[`ConnectArgs`](ConnectArgs.md).[`chainType`](ConnectArgs.md#chaintype)

***

### force?

> `optional` **force**: `boolean`

Force new connection even if already connected

***

### maxRetries?

> `optional` **maxRetries**: `number`

Maximum retry attempts

***

### silent?

> `optional` **silent**: `boolean`

Silent connection (no UI feedback)

***

### timeout?

> `optional` **timeout**: `number`

Connection timeout in milliseconds

***

### walletId

> **walletId**: `string`

Wallet ID to connect

#### Inherited from

[`ConnectArgs`](ConnectArgs.md).[`walletId`](ConnectArgs.md#walletid)
