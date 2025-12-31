[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / TokenInfo

# Interface: TokenInfo

Token information for balance queries

Contains the minimum required information to query a token's balance.
Only the contract address is required - other metadata can be fetched
automatically from the blockchain if not provided.

## Examples

```typescript
const usdcToken: TokenInfo = {
  address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  symbol: "USDC",     // Optional, can be fetched
  name: "USD Coin",   // Optional
  decimals: 6         // Optional, can be fetched
};
```

```typescript
const solToken: TokenInfo = {
  address: "So11111111111111111111111111111111111111112",
  symbol: "SOL",
  decimals: 9
};
```

## Properties

### address

> **address**: `string`

Token contract address

The on-chain address of the token contract. Format varies by blockchain:
- EVM: 0x-prefixed hexadecimal address (e.g., "0x...")
- Solana: Base58-encoded address
- Aztec: Aztec-specific address format

***

### decimals?

> `optional` **decimals**: `number`

Token decimals (optional, will be fetched if not provided)

The number of decimal places the token uses. Critical for proper
balance display. If not provided, will be fetched from the contract.

#### Remarks

Common decimal values:
- 18: Most ERC20 tokens (ETH standard)
- 6: USDC, USDT (stablecoins)
- 8: WBTC (Bitcoin representation)
- 9: Solana SPL tokens

***

### name?

> `optional` **name**: `string`

Token name (optional)

The full name of the token. This is primarily for display purposes
and does not affect balance queries.

#### Example

```ts
"USD Coin", "Wrapped Ether", "Dai Stablecoin"
```

***

### symbol?

> `optional` **symbol**: `string`

Token symbol (optional, will be fetched if not provided)

The token's trading symbol. If not provided, the service will attempt
to fetch it from the token contract. Providing it upfront improves
performance by avoiding an extra RPC call.

#### Example

```ts
"USDC", "WETH", "DAI"
```
