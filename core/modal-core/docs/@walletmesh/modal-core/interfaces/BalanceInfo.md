[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / BalanceInfo

# Interface: BalanceInfo

Balance information for native currencies and tokens

Represents balance data in both raw and human-readable formats. This interface
is used for both native blockchain currencies (ETH, SOL, etc.) and tokens
(ERC20, SPL, etc.).

## Examples

```typescript
const ethBalance: BalanceInfo = {
  value: "1234567890000000000",    // 1.23456789 ETH in wei
  formatted: "1.234",               // Human-readable format
  symbol: "ETH",                    // Currency symbol
  decimals: 18                      // Ethereum uses 18 decimals
};
```

```typescript
const usdcBalance: BalanceInfo = {
  value: "1000500000",              // 1,000.50 USDC (6 decimals)
  formatted: "1,000.50",            // Human-readable with formatting
  symbol: "USDC",                   // Token symbol
  decimals: 6                       // USDC uses 6 decimals
};
```

## Properties

### decimals

> **decimals**: `number`

The number of decimals for the currency/token

Indicates how many decimal places the smallest unit represents.
This is crucial for proper value conversion and display.

#### Example

```ts
18 for ETH, 6 for USDC, 9 for SOL
```

***

### formatted

> **formatted**: `string`

The balance as a human-readable decimal string

This is the formatted balance with proper decimal placement and optional
thousands separators. The formatting is handled by chain-specific services
to ensure proper display for each blockchain's conventions.

#### Example

```ts
"1,234.56789", "0.001", "1000000"
```

***

### symbol

> **symbol**: `string`

The symbol of the currency or token

For native currencies, this is the blockchain's native symbol (ETH, SOL, etc.).
For tokens, this is the token's symbol as defined in its contract.

#### Example

```ts
"ETH", "USDC", "SOL", "WBTC"
```

***

### value

> **value**: `string`

The balance value in the smallest unit (e.g., wei for ETH, lamports for SOL)

This is the raw blockchain value without decimal conversion. Always represented
as a string to avoid JavaScript number precision issues with large values.

#### Remarks

- For ETH: value in wei (10^18 wei = 1 ETH)
- For SOL: value in lamports (10^9 lamports = 1 SOL)
- For USDC: value in smallest unit (10^6 = 1 USDC)
