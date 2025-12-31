[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / GetNativeBalanceParams

# Interface: GetNativeBalanceParams

Parameters for getting native balance

Contains all required information to fetch the native currency balance
for an address on a specific blockchain. Native currency refers to the
blockchain's primary currency (ETH for Ethereum, SOL for Solana, etc.).

## Example

```typescript
const params: GetNativeBalanceParams = {
  provider: evmProvider,
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
  chain: ethereumMainnet // SupportedChain object,
  options: { useCache: true, staleTime: 30000 }
};
```

## Properties

### address

> **address**: `string`

The address to query balance for

Must be a valid address format for the target blockchain:
- EVM: 0x-prefixed hexadecimal (e.g., "0x123...")
- Solana: Base58-encoded address
- Aztec: Aztec-specific address format

***

### chain

> **chain**: `object`

The chain ID to query on

Identifies which blockchain to query. The service uses this to
select the appropriate chain service implementation.

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

### options?

> `optional` **options**: [`BalanceQueryOptions`](BalanceQueryOptions.md)

Optional query options

Override default caching behavior for this specific query.
If not provided, uses the service's default configuration.

***

### provider

> **provider**: [`BlockchainProvider`](BlockchainProvider.md)

Blockchain provider instance for making RPC calls

The provider must be connected and configured for the target chain.
Different blockchain types require different provider implementations.
