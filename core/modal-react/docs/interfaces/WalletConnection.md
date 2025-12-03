[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletConnection

# Interface: WalletConnection

Defined in: core/modal-core/dist/api/types/connection.d.ts:89

Wallet connection details

 WalletConnection

## Properties

### accounts

> **accounts**: `string`[]

Defined in: core/modal-core/dist/api/types/connection.d.ts:95

Connected accounts

***

### address

> **address**: `string`

Defined in: core/modal-core/dist/api/types/connection.d.ts:93

Primary connected address

***

### chain

> **chain**: `object`

Defined in: core/modal-core/dist/api/types/connection.d.ts:97

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

Defined in: core/modal-core/dist/api/types/connection.d.ts:99

Connected chain type

***

### metadata?

> `optional` **metadata**: `object`

Defined in: core/modal-core/dist/api/types/connection.d.ts:107

Connection metadata

#### connectedAt

> **connectedAt**: `number`

Connection timestamp

#### lastActiveAt

> **lastActiveAt**: `number`

Last activity timestamp

#### sessionMetadata?

> `optional` **sessionMetadata**: `Record`\<`string`, `unknown`\>

Session-specific metadata from wallet

#### source?

> `optional` **source**: `string`

Connection source

***

### provider

> **provider**: `unknown`

Defined in: core/modal-core/dist/api/types/connection.d.ts:101

Provider instance

***

### sessionId?

> `optional` **sessionId**: `string`

Defined in: core/modal-core/dist/api/types/connection.d.ts:105

Session identifier for reconnection

***

### walletId

> **walletId**: `string`

Defined in: core/modal-core/dist/api/types/connection.d.ts:91

Wallet identifier

***

### walletInfo

> **walletInfo**: [`WalletInfo`](WalletInfo.md)

Defined in: core/modal-core/dist/api/types/connection.d.ts:103

Wallet info/metadata
