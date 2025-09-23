[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainSessionInfo

# Interface: ChainSessionInfo

Chain information within a session

## Extends

- [`SupportedChain`](../type-aliases/SupportedChain.md)

## Properties

### chainId

> **chainId**: `string` = `caip2Schema`

Chain identifier in CAIP-2 format

#### Inherited from

`SupportedChain.chainId`

***

### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md) = `chainTypeSchema`

Type of blockchain this chain belongs to

#### Inherited from

`SupportedChain.chainType`

***

### group?

> `optional` **group**: `string`

Grouping identifier for multi-chain scenarios

#### Inherited from

`SupportedChain.group`

***

### icon?

> `optional` **icon**: `string`

Optional icon URL for the chain

#### Inherited from

`SupportedChain.icon`

***

### interfaces?

> `optional` **interfaces**: `string`[]

List of required provider interfaces for this chain

#### Inherited from

`SupportedChain.interfaces`

***

### isNative?

> `optional` **isNative**: `boolean`

Whether this is the native chain for the wallet

***

### label?

> `optional` **label**: `string`

Display label for the chain (optional override of name)

#### Inherited from

`SupportedChain.label`

***

### name

> **name**: `string`

Human-readable name of the chain

#### Inherited from

`SupportedChain.name`

***

### required

> **required**: `boolean`

Whether this chain is required for the dApp to function

#### Inherited from

`SupportedChain.required`
