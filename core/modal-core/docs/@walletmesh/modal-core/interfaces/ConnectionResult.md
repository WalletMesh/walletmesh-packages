[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ConnectionResult

# Interface: ConnectionResult

Connection result interface returned after successful wallet connection

## Remarks

Contains all information about a successful wallet connection including
account details, chain information, and provider instance for blockchain interactions.

## Example

```typescript
const result: ConnectionResult = await modal.connect('metamask');

console.log('Connected to:', result.walletInfo.name);
console.log('Address:', result.address);
console.log('Chain:', result.chain.name);

// Use the provider for blockchain operations
const balance = await result.provider.getBalance(result.address);
```

## Properties

### accounts

> **accounts**: `string`[]

Array of all available account addresses

***

### address

> **address**: `string`

Primary account address

***

### chain

> **chain**: `object`

Connected blockchain chain information

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

### provider

> **provider**: `unknown`

Provider instance for blockchain interactions (type depends on chainType)

***

### walletId

> **walletId**: `string`

ID of the connected wallet

***

### walletInfo

> **walletInfo**: [`WalletInfo`](WalletInfo.md)

Complete wallet information including metadata
