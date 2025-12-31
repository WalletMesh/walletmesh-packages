[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / AdapterEvents

# Type Alias: AdapterEvents

> **AdapterEvents** = `object`

Type-safe event system

## Properties

### accounts:changed

> **accounts:changed**: `object`

#### accounts

> **accounts**: `string`[]

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

***

### chain:changed

> **chain:changed**: `object`

#### chainId

> **chainId**: `string`

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

***

### connection:established

> **connection:established**: `object`

#### connection

> **connection**: [`WalletConnection`](../interfaces/WalletConnection.md)

***

### connection:lost

> **connection:lost**: `object`

#### error?

> `optional` **error**: [`ModalError`](ModalError.md)

#### reason

> **reason**: `string`

***

### error

> **error**: `object`

#### error

> **error**: [`ModalError`](ModalError.md)

#### operation

> **operation**: `string`

***

### state:changed

> **state:changed**: `object`

#### state

> **state**: [`WalletAdapterConnectionState`](../interfaces/WalletAdapterConnectionState.md)

***

### wallet:accountsChanged

> **wallet:accountsChanged**: `object`

#### accounts

> **accounts**: `string`[]

#### chainType?

> `optional` **chainType**: [`ChainType`](../enumerations/ChainType.md)

***

### wallet:chainChanged

> **wallet:chainChanged**: `object`

#### chainId

> **chainId**: `string`

#### chainType?

> `optional` **chainType**: [`ChainType`](../enumerations/ChainType.md)

***

### wallet:connected

> **wallet:connected**: `unknown`

***

### wallet:disconnected

> **wallet:disconnected**: `object`

#### reason?

> `optional` **reason**: `string`

***

### wallet:sessionTerminated

> **wallet:sessionTerminated**: `object`

#### chainType?

> `optional` **chainType**: [`ChainType`](../enumerations/ChainType.md)

#### reason?

> `optional` **reason**: `string`

#### sessionId

> **sessionId**: `string`

***

### wallet:statusChanged

> **wallet:statusChanged**: `unknown`
