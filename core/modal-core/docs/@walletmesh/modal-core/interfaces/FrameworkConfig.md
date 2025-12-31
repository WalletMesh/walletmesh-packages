[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / FrameworkConfig

# Interface: FrameworkConfig

Framework configuration interface

Represents a framework-specific configuration that needs to be transformed
to the core WalletMesh configuration format.

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

Supported chains

#### chainId

> **chainId**: `string` = `caip2Schema`

Chain identifier in CAIP-2 format

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md) = `chainTypeSchema`

Type of blockchain this chain belongs to

#### group?

> `optional` **group**: `string`

Grouping identifier for multi-chain scenarios

#### icon?

> `optional` **icon**: `string`

Optional icon URL for the chain

#### interfaces?

> `optional` **interfaces**: `string`[]

List of required provider interfaces for this chain

#### label?

> `optional` **label**: `string`

Display label for the chain (optional override of name)

#### name

> **name**: `string`

Human-readable name of the chain

#### required

> **required**: `boolean`

Whether this chain is required for the dApp to function

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

> `optional` **wallets**: (`string` \| [`WalletInfo`](WalletInfo.md))[]

Wallet configuration - can be array of wallet IDs or wallet objects
