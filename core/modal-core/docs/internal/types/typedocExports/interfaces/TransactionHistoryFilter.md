[**@walletmesh/modal-core v0.0.1**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / TransactionHistoryFilter

# Interface: TransactionHistoryFilter

Filter options for querying transaction history.

Allows flexible filtering by various transaction properties with support
for pagination. All filters are optional and can be combined.

## Remarks

- Multiple filters are combined with AND logic
- Status can be a single value or array for OR logic
- Time range uses Unix timestamps (milliseconds)
- Results are sorted by startTime descending (newest first)

## Example

```typescript
// Get all pending transactions
const pending = txService.getTransactionHistory({
  status: ['signing', 'broadcasting', 'confirming']
});

// Get failed transactions from last hour on Ethereum
const recentFailures = txService.getTransactionHistory({
  chainId: '1',
  status: 'failed',
  timeRange: {
    start: Date.now() - 3600000, // 1 hour ago
    end: Date.now()
  }
});

// Paginated results for a specific wallet
const page1 = txService.getTransactionHistory({
  walletId: 'metamask',
  limit: 20,
  offset: 0
});

const page2 = txService.getTransactionHistory({
  walletId: 'metamask',
  limit: 20,
  offset: 20
});
```

## Properties

### chainId?

> `optional` **chainId**: `string`

Filter by specific chain ID (e.g., '1' for Ethereum mainnet)

***

### chainType?

> `optional` **chainType**: [`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)

Filter by blockchain type (evm, solana, aztec)

***

### limit?

> `optional` **limit**: `number`

Maximum number of results to return

***

### offset?

> `optional` **offset**: `number`

Number of results to skip for pagination

***

### status?

> `optional` **status**: [`TransactionStatus`](../../../../@walletmesh/modal-core/type-aliases/TransactionStatus.md) \| [`TransactionStatus`](../../../../@walletmesh/modal-core/type-aliases/TransactionStatus.md)[]

Filter by transaction status (single value or array for multiple)

***

### timeRange?

> `optional` **timeRange**: `object`

Filter by time range using Unix timestamps in milliseconds

#### end

> **end**: `number`

End timestamp (inclusive)

#### start

> **start**: `number`

Start timestamp (inclusive)

***

### walletId?

> `optional` **walletId**: `string`

Filter by wallet ID that sent the transaction
