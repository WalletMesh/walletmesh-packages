[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / SendTransactionParams

# Interface: SendTransactionParams\<T\>

Parameters for sending a blockchain transaction.

Contains all information needed to send a transaction across different blockchain types.
The generic type parameter ensures type safety between chainType and params.

## Example

```typescript
// EVM transaction
const evmParams: SendTransactionParams<'evm'> = {
  params: {
    to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
    value: '1000000000000000000',
    data: '0x'
  },
  provider: evmProvider,
  chainType: 'evm',
  chain: ethereumMainnet, // SupportedChain object
  walletId: 'metamask',
  address: '0xYourAddress'
};

// Solana transaction
const solanaParams: SendTransactionParams<'solana'> = {
  params: {
    transaction: serializedTransaction,
    options: { skipPreflight: false }
  },
  provider: solanaProvider,
  chainType: 'solana',
  chain: solanaMainnet, // SupportedChain object
  walletId: 'phantom',
  address: 'YourSolanaAddress'
};
```

## Type Parameters

### T

`T` *extends* [`ChainType`](../enumerations/ChainType.md) = [`ChainType`](../enumerations/ChainType.md)

The chain type which determines the structure of params

## Properties

### address

> **address**: `string`

Address of the account sending the transaction.
Must be the currently connected address in the wallet.

***

### chain

> **chain**: `object`

Chain configuration for the blockchain network.

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

> **chainType**: `T`

Type of blockchain network (evm, solana, aztec).
Determines transaction format and processing logic.

***

### params

> **params**: [`TransactionRequest`](../type-aliases/TransactionRequest.md)\<`T`\>

Transaction request containing chain-specific parameters.
Structure varies based on the chainType (EVM, Solana, Aztec).

***

### provider

> **provider**: [`BlockchainProvider`](BlockchainProvider.md)

Blockchain provider instance for communicating with the wallet.
Must be compatible with the specified chainType.

***

### walletId

> **walletId**: `string`

Identifier of the wallet sending the transaction.
Used for tracking and multi-wallet scenarios.
