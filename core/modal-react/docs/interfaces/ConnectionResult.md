[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ConnectionResult

# Interface: ConnectionResult

Defined in: core/modal-core/dist/core/types.d.ts:329

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

Defined in: core/modal-core/dist/core/types.d.ts:333

Array of all available account addresses

***

### address

> **address**: `string`

Defined in: core/modal-core/dist/core/types.d.ts:331

Primary account address

***

### chain

> **chain**: `object`

Defined in: core/modal-core/dist/core/types.d.ts:335

Connected blockchain chain information

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

### provider

> **provider**: `unknown`

Defined in: core/modal-core/dist/core/types.d.ts:337

Provider instance for blockchain interactions (type depends on chainType)

***

### walletId

> **walletId**: `string`

Defined in: core/modal-core/dist/core/types.d.ts:339

ID of the connected wallet

***

### walletInfo

> **walletInfo**: [`WalletInfo`](WalletInfo.md)

Defined in: core/modal-core/dist/core/types.d.ts:341

Complete wallet information including metadata
