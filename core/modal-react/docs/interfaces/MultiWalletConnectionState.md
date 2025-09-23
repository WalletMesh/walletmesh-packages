[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / MultiWalletConnectionState

# Interface: MultiWalletConnectionState

Defined in: core/modal-core/dist/api/types/connection.d.ts:65

Multi-wallet connection state for individual wallet tracking

 MultiWalletConnectionState

## Properties

### accounts

> **accounts**: `string`[]

Defined in: core/modal-core/dist/api/types/connection.d.ts:71

List of connected accounts

***

### address

> **address**: `string`

Defined in: core/modal-core/dist/api/types/connection.d.ts:69

Primary connected address

***

### chain

> **chain**: `object`

Defined in: core/modal-core/dist/api/types/connection.d.ts:73

Connected chain

#### chainId

> **chainId**: `string`

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

#### group?

> `optional` **group**: `string`

#### icon?

> `optional` **icon**: `string`

#### interfaces?

> `optional` **interfaces**: `string`[]

#### label?

> `optional` **label**: `string`

#### name

> **name**: `string`

#### required

> **required**: `boolean`

***

### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

Defined in: core/modal-core/dist/api/types/connection.d.ts:75

Connected chain type

***

### connectedAt

> **connectedAt**: `number`

Defined in: core/modal-core/dist/api/types/connection.d.ts:79

Timestamp when connected

***

### lastActiveAt

> **lastActiveAt**: `number`

Defined in: core/modal-core/dist/api/types/connection.d.ts:81

Timestamp of last activity

***

### provider

> **provider**: `unknown`

Defined in: core/modal-core/dist/api/types/connection.d.ts:77

Provider instance for this connection

***

### walletId

> **walletId**: `string`

Defined in: core/modal-core/dist/api/types/connection.d.ts:67

Wallet identifier
