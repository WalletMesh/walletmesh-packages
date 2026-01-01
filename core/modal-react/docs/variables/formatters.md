[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / formatters

# Variable: formatters

> `const` **formatters**: `object`

Defined in: core/modal-core/dist/api/utils/formatters.d.ts:21

Collection of formatting utilities for blockchain data

## Type Declaration

### formatBalance()

> **formatBalance**: (`balance`, `decimals?`, `symbol?`) => `string`

Format a balance with proper decimals and units

#### Parameters

##### balance

The balance to format (in wei or smallest unit)

`string` | `number`

##### decimals?

`number`

Number of decimals to convert from (default: 18)

##### symbol?

`string`

Token symbol to append (default: '')

#### Returns

`string`

Formatted balance string

#### Example

```typescript
formatters.formatBalance('1234567890123456789', 18, 'ETH')
// Returns: "1.23 ETH"
```

### formatChainName()

> **formatChainName**: (`chainId`) => `string`

Format a chain ID to a human-readable name

#### Parameters

##### chainId

The chain ID (string or number)

`string` | `number`

#### Returns

`string`

Human-readable chain name

#### Example

```typescript
formatters.formatChainName('0x1')
// Returns: "Ethereum"

formatters.formatChainName('0x999')
// Returns: "Chain 0x999"
```

### formatCurrency()

> **formatCurrency**: (`amount`, `currency?`, `decimals?`) => `string`

Format a currency amount with proper locale formatting

#### Parameters

##### amount

The amount to format

`string` | `number`

##### currency?

`string`

The currency code (default: 'USD')

##### decimals?

`number`

Number of decimal places (default: 2)

#### Returns

`string`

Formatted currency string

#### Example

```typescript
formatters.formatCurrency(1234.56, 'USD', 2)
// Returns: "$1,234.56"
```

### formatDate()

> **formatDate**: (`timestamp`, `format?`) => `string`

Format a timestamp to a readable date

#### Parameters

##### timestamp

The timestamp (number or Date object)

`number` | `Date`

##### format?

The format type ('short', 'long', or 'relative')

`"short"` | `"long"` | `"relative"`

#### Returns

`string`

Formatted date string

#### Example

```typescript
formatters.formatDate(Date.now(), 'relative')
// Returns: "2 hours ago"

formatters.formatDate(Date.now(), 'short')
// Returns: "Dec 19, 2:30 PM"
```

### formatNumber()

> **formatNumber**: (`num`, `decimals?`) => `string`

Format a number with proper locale formatting

#### Parameters

##### num

The number to format

`string` | `number`

##### decimals?

`number`

Number of decimal places (default: 2)

#### Returns

`string`

Formatted number string

#### Example

```typescript
formatters.formatNumber(1234.567, 2)
// Returns: "1,234.57"
```

### formatTransactionHash()

> **formatTransactionHash**: (`hash`, `startChars?`, `endChars?`) => `string`

Format a transaction hash to a shortened format

#### Parameters

##### hash

`string`

The transaction hash

##### startChars?

`number`

Number of characters to show at start (default: 6)

##### endChars?

`number`

Number of characters to show at end (default: 4)

#### Returns

`string`

Shortened transaction hash

#### Example

```typescript
formatters.formatTransactionHash('0x1234567890abcdef1234567890abcdef12345678')
// Returns: "0x1234...5678"
```

### formatTxHash()

> **formatTxHash**: (`hash`, `chars?`) => `string`

Format a transaction hash to a shortened format

#### Parameters

##### hash

`string`

The transaction hash

##### chars?

`number`

Number of characters to show at start and end (default: 6)

#### Returns

`string`

Shortened transaction hash

#### Example

```typescript
formatters.formatTxHash('0x1234567890abcdef1234567890abcdef12345678', 8)
// Returns: "0x12345678...12345678"
```

### formatWalletName()

> **formatWalletName**: (`walletId`) => `string`

Format wallet name with proper capitalization

#### Parameters

##### walletId

`string`

The wallet ID or name

#### Returns

`string`

Formatted wallet name

#### Example

```typescript
formatters.formatWalletName('metamask')
// Returns: "MetaMask"

formatters.formatWalletName('walletconnect')
// Returns: "WalletConnect"
```

### shortenAddress()

> **shortenAddress**: (`address`, `startChars?`, `endChars?`) => `string`

Shorten an Ethereum address to a readable format

#### Parameters

##### address

`string`

The address to shorten

##### startChars?

`number`

Number of characters to show at start (default: 6)

##### endChars?

`number`

Number of characters to show at end (default: 4)

#### Returns

`string`

Shortened address in format "0x1234...5678"

#### Example

```typescript
formatters.shortenAddress('0x1234567890123456789012345678901234567890')
// Returns: "0x1234...7890"
```
