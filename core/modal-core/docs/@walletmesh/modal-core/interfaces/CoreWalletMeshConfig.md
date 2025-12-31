[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / CoreWalletMeshConfig

# Interface: CoreWalletMeshConfig

Core WalletMesh configuration interface for framework transformation

The target format that framework configurations are transformed into.

## Properties

### appDescription?

> `optional` **appDescription**: `string`

Application description (optional)

***

### appIcon?

> `optional` **appIcon**: `string`

Application icon URL (optional)

***

### appName

> **appName**: `string`

Application name

***

### appUrl?

> `optional` **appUrl**: `string`

Application URL (optional)

***

### chains?

> `optional` **chains**: `object`[]

Chain configurations

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

#### required?

> `optional` **required**: `boolean`

***

### debug?

> `optional` **debug**: `boolean`

Debug mode flag (optional)

***

### projectId?

> `optional` **projectId**: `string`

Project ID for analytics/tracking (optional)

***

### wallets?

> `optional` **wallets**: `object`

Wallet configurations

#### exclude?

> `optional` **exclude**: `string`[]

#### include?

> `optional` **include**: `string`[]
