[**@walletmesh/modal-core v0.0.3**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / TransactionServiceConfig

# Interface: TransactionServiceConfig

Configuration options for the TransactionService.

Allows customization of transaction monitoring behavior, timeouts, and gas estimation.
All options are optional with sensible defaults.

## Example

```typescript
const config: TransactionServiceConfig = {
  confirmations: 2,              // Wait for 2 block confirmations
  confirmationTimeout: 120000,   // 2 minute timeout
  pollingInterval: 3000,         // Check every 3 seconds
  maxHistorySize: 200,           // Keep 200 transactions
  gasMultiplier: 1.2             // 20% gas buffer
};

const txService = new TransactionService(dependencies);
txService.configure(config);
```

## Properties

### confirmations?

> `optional` **confirmations**: `number`

Number of block confirmations to wait for before considering a transaction confirmed.
Higher values provide more security but longer wait times.

#### Default

```ts
1
```

***

### confirmationTimeout?

> `optional` **confirmationTimeout**: `number`

Maximum time to wait for transaction confirmation in milliseconds.
Transaction will be marked as failed if not confirmed within this time.

#### Default

```ts
60000 (60 seconds)
```

***

### gasMultiplier?

> `optional` **gasMultiplier**: `number`

Multiplier applied to gas estimates for safety buffer.
Helps prevent out-of-gas errors due to estimation variance.

#### Default

```ts
1.1 (10% buffer)
```

***

### maxHistorySize?

> `optional` **maxHistorySize**: `number`

Maximum number of transactions to keep in history.
Older completed transactions are pruned when limit is exceeded.

#### Default

```ts
100
```

***

### pollingInterval?

> `optional` **pollingInterval**: `number`

Interval between transaction status checks in milliseconds.
Lower values provide faster updates but more network requests.

#### Default

```ts
2000 (2 seconds)
```
