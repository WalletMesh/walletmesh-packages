[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / EnsureChainParams

# Interface: EnsureChainParams

Parameters for ensuring chain

## Example

```ts
const params: EnsureChainParams = {
  requiredChainId: '1',
  walletId: 'metamask',
  options: {
    errorMessage: 'This dApp requires Ethereum Mainnet'
  }
};
```

## Properties

### options?

> `optional` **options**: [`ChainValidationOptions`](ChainValidationOptions.md)

Optional validation options

***

### requiredChain

> **requiredChain**: `object`

Required chain

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

### walletId?

> `optional` **walletId**: `string`

Optional wallet ID
