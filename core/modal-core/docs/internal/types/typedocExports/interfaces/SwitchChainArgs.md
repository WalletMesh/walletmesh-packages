[**@walletmesh/modal-core v0.0.2**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / SwitchChainArgs

# Interface: SwitchChainArgs

Switch chain arguments

## Properties

### addChainData?

> `optional` **addChainData**: `object`

Optional chain addition data

#### blockExplorerUrls?

> `optional` **blockExplorerUrls**: `string`[]

Block explorer URLs

#### chain

> **chain**: `object`

Chain to add

##### chain.chainId

> **chainId**: `string` = `caip2Schema`

Chain identifier in CAIP-2 format

##### chain.chainType

> **chainType**: [`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md) = `chainTypeSchema`

Type of blockchain this chain belongs to

##### chain.group?

> `optional` **group**: `string`

Grouping identifier for multi-chain scenarios

##### chain.icon?

> `optional` **icon**: `string`

Optional icon URL for the chain

##### chain.interfaces?

> `optional` **interfaces**: `string`[]

List of required provider interfaces for this chain

##### chain.label?

> `optional` **label**: `string`

Display label for the chain (optional override of name)

##### chain.name

> **name**: `string`

Human-readable name of the chain

##### chain.required

> **required**: `boolean`

Whether this chain is required for the dApp to function

#### nativeCurrency

> **nativeCurrency**: `object`

Native currency info

##### nativeCurrency.decimals

> **decimals**: `number`

##### nativeCurrency.name

> **name**: `string`

##### nativeCurrency.symbol

> **symbol**: `string`

#### rpcUrls

> **rpcUrls**: `string`[]

RPC URLs

***

### chain

> **chain**: `object`

Chain to switch to

#### chainId

> **chainId**: `string` = `caip2Schema`

Chain identifier in CAIP-2 format

#### chainType

> **chainType**: [`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md) = `chainTypeSchema`

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
