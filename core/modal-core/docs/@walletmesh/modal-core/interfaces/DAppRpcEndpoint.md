[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DAppRpcEndpoint

# Interface: DAppRpcEndpoint

dApp RPC endpoint configuration

## Properties

### chain

> **chain**: `object`

Chain this endpoint serves

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

### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

Chain type

***

### config?

> `optional` **config**: [`DAppRpcConfig`](DAppRpcConfig.md)

Configuration for this endpoint

***

### urls

> **urls**: `string`[]

RPC endpoint URLs (primary and fallbacks)
