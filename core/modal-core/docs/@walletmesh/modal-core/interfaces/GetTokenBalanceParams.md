[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / GetTokenBalanceParams

# Interface: GetTokenBalanceParams

Parameters for getting token balance

Contains all required information to fetch a token balance for an address.
Tokens are smart contract-based assets (ERC20, SPL, etc.) as opposed to
native blockchain currencies.

## Examples

```typescript
const params: GetTokenBalanceParams = {
  provider: evmProvider,
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
  chain: ethereumMainnet // SupportedChain object,
  token: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    decimals: 6
  }
};
```

```typescript
const params: GetTokenBalanceParams = {
  provider: solanaProvider,
  address: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
  chain: solanaMainnet, // SupportedChain object
  token: {
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  }
};
```

## Properties

### address

> **address**: `string`

The address to query balance for

The wallet or account address whose token balance is being queried.
Must be valid for the target blockchain.

***

### chain

> **chain**: `object`

The chain ID to query on

Identifies the blockchain where the token contract exists.
Must match the chain the provider is connected to.

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

Control caching behavior for this query. Useful for tokens
with frequently changing balances or stable balances.

***

### provider

> **provider**: [`BlockchainProvider`](BlockchainProvider.md)

Blockchain provider instance for making RPC calls

Must be configured for the blockchain where the token exists.
The provider is used for contract calls to fetch balance and metadata.

***

### token

> **token**: [`TokenInfo`](TokenInfo.md)

Token information including contract address

At minimum, must include the token's contract address.
Additional metadata (symbol, decimals) improves performance
by avoiding extra RPC calls.
