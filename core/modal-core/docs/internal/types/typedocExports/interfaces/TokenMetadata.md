[**@walletmesh/modal-core v0.0.4**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / TokenMetadata

# Interface: TokenMetadata

Token metadata retrieved from blockchain

Complete token information fetched from a token contract. This interface
represents the full metadata available on-chain for a token.

## Example

```typescript
const metadata: TokenMetadata = {
  symbol: "USDC",
  name: "USD Coin",
  decimals: 6,
  totalSupply: "32451936029610000"  // 32.45B USDC
};
```

## Properties

### decimals

> **decimals**: `number`

Token decimals

The number of decimal places defined in the token contract.
Used for converting between smallest unit and display values.

***

### name

> **name**: `string`

Token name

The full descriptive name of the token from the contract.

***

### symbol

> **symbol**: `string`

Token symbol

The official trading symbol as defined in the token contract.

***

### totalSupply?

> `optional` **totalSupply**: `string`

Total supply (optional)

The total supply of tokens in circulation, in the smallest unit.
May not be available for all tokens (e.g., tokens with dynamic supply).

#### Example

```ts
"1000000000000" for 1M tokens with 6 decimals
```
