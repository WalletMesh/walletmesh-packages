[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / TransactionService

# Class: TransactionService

Re-export core services

## Constructors

### Constructor

> **new TransactionService**(`dependencies`): `TransactionService`

#### Parameters

##### dependencies

[`TransactionServiceDependencies`](../interfaces/TransactionServiceDependencies.md)

#### Returns

`TransactionService`

## Methods

### cleanup()

> **cleanup**(): `void`

Clear pending confirmations and cleanup resources

This method should be called when the service is no longer needed to free up resources,
clear pending confirmation promises, and stop any active intervals.

#### Returns

`void`

#### Example

```typescript
// On component unmount or service disposal
txService.cleanup();
```

***

### clearHistory()

> **clearHistory**(): `void`

Clear transaction history

Removes all completed and failed transactions from the history. Active transactions
(preparing, signing, broadcasting, confirming) are preserved to prevent data loss.

#### Returns

`void`

#### Example

```typescript
// Clear history periodically
setInterval(() => {
  txService.clearHistory();
  console.log('Transaction history cleared');
}, 3600000); // Every hour

// Clear before disconnecting
txService.clearHistory();
await wallet.disconnect();
```

***

### computeLoadingState()

> **computeLoadingState**(`status`): `boolean`

Compute loading state from transaction status.

Determines if a transaction is in an active/loading state based on its status.
Used by React hooks to manage UI loading indicators.

#### Parameters

##### status

[`TransactionStatus`](../type-aliases/TransactionStatus.md)

Current transaction status

#### Returns

`boolean`

True if transaction is actively processing

#### Remarks

- Loading states: preparing, proving, signing, broadcasting
- Non-loading: idle, confirming, confirmed, failed
- Confirming is not considered loading (passive wait)

#### Example

```typescript
const isLoading = txService.computeLoadingState(transaction.status);
if (isLoading) {
  showSpinner();
}
```

***

### configure()

> **configure**(`config?`): `void`

Configure transaction service with custom settings

Allows customization of confirmation timeouts, polling intervals, and other service behavior.
This method is optional - the service will use default values if not called.

#### Parameters

##### config?

[`TransactionServiceConfig`](../../../internal/types/typedocExports/interfaces/TransactionServiceConfig.md)

Optional configuration object

#### Returns

`void`

#### Example

```typescript
txService.configure({
  confirmationTimeout: 120000,     // 2 minutes
  pollingInterval: 3000,           // 3 seconds
  maxHistorySize: 200,             // Keep 200 transactions
  gasMultiplier: 1.2        // 20% gas buffer
});
```

***

### convertToReactError()

> **convertToReactError**(`coreError`): [`TransactionError`](../../../internal/types/typedocExports/interfaces/TransactionError.md)

Convert core transaction error to React-compatible error.

Ensures error objects have the proper structure for React error boundaries
and hooks while maintaining all transaction-specific context.

#### Parameters

##### coreError

[`TransactionError`](../../../internal/types/typedocExports/interfaces/TransactionError.md)

Original transaction error

#### Returns

[`TransactionError`](../../../internal/types/typedocExports/interfaces/TransactionError.md)

Properly formatted TransactionError

#### Remarks

- Preserves all error properties
- Ensures proper prototype chain
- Maintains stage and transaction ID
- Compatible with React error handling

***

### estimateGas()

> **estimateGas**(`params`, `provider`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`GasEstimationResult`](../../../internal/types/typedocExports/interfaces/GasEstimationResult.md)\>

Estimate gas for EVM transaction

Calculates the estimated gas limit and cost for an EVM transaction. Automatically
applies a gas buffer based on the configured gasMultiplier. Supports both
legacy and EIP-1559 gas pricing.

#### Parameters

##### params

[`EVMTransactionParams`](../interfaces/EVMTransactionParams.md)

EVM transaction parameters

##### provider

[`BlockchainProvider`](../interfaces/BlockchainProvider.md)

EVM-compatible blockchain provider

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`GasEstimationResult`](../../../internal/types/typedocExports/interfaces/GasEstimationResult.md)\>

Promise resolving to gas estimation details

#### Throws

Invalid params error if 'to' address is missing

#### Throws

Gas estimation failed error if estimation fails

#### Example

```typescript
// Estimate gas for a simple transfer
const gasEstimate = await txService.estimateGas({
  to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
  from: '0xYourAddress',
  value: '1000000000000000000' // 1 ETH
}, provider);

console.log(`Gas limit: ${gasEstimate.gasLimit}`);
console.log(`Estimated cost: ${gasEstimate.estimatedCost} wei`);

// Estimate gas for contract interaction
const contractGasEstimate = await txService.estimateGas({
  to: '0xContractAddress',
  from: '0xYourAddress',
  data: '0xMethodSignature...'
}, provider);

// Check if EIP-1559 is supported
if (contractGasEstimate.maxFeePerGas) {
  console.log(`Max fee: ${contractGasEstimate.maxFeePerGas}`);
  console.log(`Priority fee: ${contractGasEstimate.maxPriorityFeePerGas}`);
} else {
  console.log(`Gas price: ${contractGasEstimate.gasPrice}`);
}
```

***

### failAllActiveTransactions()

> **failAllActiveTransactions**(`sessionId?`, `reason?`): `void`

Fail all active transactions when session ends

Called when a wallet session is terminated or disconnected.
Marks all pending transactions as failed and cleans up polling resources.
This prevents transactions from getting stuck in a polling state after disconnect.

#### Parameters

##### sessionId?

`string`

Optional session ID to match transactions

##### reason?

`string` = `'Session disconnected'`

Reason for session termination

#### Returns

`void`

#### Example

```typescript
// Called when session disconnects
txService.failAllActiveTransactions('session-123', 'Session disconnected');
```

***

### getAllTransactions()

> **getAllTransactions**(): [`TransactionResult`](../interfaces/TransactionResult.md)[]

Get all transactions

Returns all transactions currently stored in the service. Note that the service
maintains a limited history based on the configured maxHistorySize.

#### Returns

[`TransactionResult`](../interfaces/TransactionResult.md)[]

Array of all transaction results

#### Example

```typescript
const allTransactions = txService.getAllTransactions();
console.log(`Total transactions: ${allTransactions.length}`);

// Filter by status
const pending = allTransactions.filter(tx => tx.status === 'confirming');
console.log(`Pending transactions: ${pending.length}`);
```

***

### getTransaction()

> **getTransaction**(`id`): `null` \| [`TransactionResult`](../interfaces/TransactionResult.md)

Get a transaction by ID

Retrieves a transaction from the service's internal registry using its unique ID.

#### Parameters

##### id

`string`

The unique transaction ID generated when the transaction was sent

#### Returns

`null` \| [`TransactionResult`](../interfaces/TransactionResult.md)

The transaction result if found, null otherwise

#### Example

```typescript
const transaction = txService.getTransaction('tx_1234567_abc');
if (transaction) {
  console.log(`Status: ${transaction.status}`);
  console.log(`Hash: ${transaction.txHash}`);
}
```

***

### getTransactionByHash()

> **getTransactionByHash**(`hash`): `null` \| [`TransactionResult`](../interfaces/TransactionResult.md)

Get transaction by hash

Searches for a transaction using its blockchain hash. Useful when you have
a transaction hash from an external source.

#### Parameters

##### hash

`string`

The blockchain transaction hash

#### Returns

`null` \| [`TransactionResult`](../interfaces/TransactionResult.md)

The transaction result if found, null otherwise

#### Example

```typescript
const transaction = txService.getTransactionByHash('0x123...abc');
if (transaction) {
  console.log(`Found transaction: ${transaction.id}`);
  const receipt = await transaction.wait();
}
```

***

### getTransactionHistory()

> **getTransactionHistory**(`filter?`): [`TransactionResult`](../interfaces/TransactionResult.md)[]

Get transaction history with optional filtering

Retrieves transaction history with support for filtering by chain, wallet, status,
time range, and pagination. Results are sorted by start time (newest first).

#### Parameters

##### filter?

[`TransactionHistoryFilter`](../../../internal/types/typedocExports/interfaces/TransactionHistoryFilter.md)

Optional filter criteria

#### Returns

[`TransactionResult`](../interfaces/TransactionResult.md)[]

Array of filtered transaction results, sorted newest first

#### Example

```typescript
// Get all confirmed transactions
const confirmed = txService.getTransactionHistory({
  status: 'confirmed'
});

// Get transactions for a specific wallet and chain
const walletTxs = txService.getTransactionHistory({
  walletId: 'metamask',
  chain: ethereumMainnet, // SupportedChain object
  status: ['confirmed', 'failed']
});

// Get transactions from last hour
const recentTxs = txService.getTransactionHistory({
  timeRange: {
    start: Date.now() - 3600000, // 1 hour ago
    end: Date.now()
  }
});

// Paginated results
const page2 = txService.getTransactionHistory({
  offset: 10,
  limit: 10
});
```

***

### sendTransaction()

> **sendTransaction**\<`T`\>(`params`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`TransactionResult`](../interfaces/TransactionResult.md)\>

Send a transaction

Sends a blockchain transaction and monitors its confirmation status. Supports multiple
chain types with automatic formatting and validation. The returned result includes
a `wait()` method for awaiting confirmation.

#### Type Parameters

##### T

`T` *extends* [`ChainType`](../enumerations/ChainType.md) = [`ChainType`](../enumerations/ChainType.md)

The chain type (EVM, Solana, Aztec)

#### Parameters

##### params

[`SendTransactionParams`](../interfaces/SendTransactionParams.md)\<`T`\>

Transaction parameters including request, provider, and metadata

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`TransactionResult`](../interfaces/TransactionResult.md)\>

Promise resolving to transaction result with hash and wait method

#### Throws

Validation error if transaction parameters are invalid

#### Throws

Transaction failed error if signing or broadcasting fails

#### Throws

Timeout error if confirmation takes too long

#### Remarks

Emits the following events:
- `transaction-sent` - When a transaction is successfully sent
- `transaction-confirmed` - When a transaction is confirmed
- `transaction-failed` - When a transaction fails

#### Example

```typescript
// Send EVM transaction
const result = await txService.sendTransaction({
  params: {
    evm: {
      to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
      value: '1000000000000000000', // 1 ETH
      data: '0x'
    }
  },
  provider,
  chainType: ChainType.Evm,
  chain: ethereumMainnet, // SupportedChain object
  walletId: 'metamask',
  address: '0xYourAddress'
});

console.log(`Transaction sent: ${result.hash}`);

// Wait for confirmation
try {
  const receipt = await result.wait();
  console.log(`Confirmed in block ${receipt.blockNumber}`);
} catch (error) {
  console.error('Transaction failed:', error);
}

// Send Solana transaction
const solanaResult = await txService.sendTransaction({
  params: {
    solana: {
      transaction: serializedTransaction,
      options: { skipPreflight: false }
    }
  },
  provider: solanaProvider,
  chainType: ChainType.Solana,
  chain: solanaMainnet, // SupportedChain object
  walletId: 'phantom',
  address: 'YourSolanaAddress'
});
```

***

### simulateTransaction()

> **simulateTransaction**(`params`, `provider`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`\>

Simulate Solana transaction

Simulates a Solana transaction to check if it would succeed without actually
submitting it to the blockchain. Useful for validating transaction parameters
and estimating compute units.

#### Parameters

##### params

[`SolanaTransactionParams`](../interfaces/SolanaTransactionParams.md)

Solana transaction parameters

##### provider

[`BlockchainProvider`](../interfaces/BlockchainProvider.md)

Solana-compatible blockchain provider

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`\>

Promise resolving to simulation result from the Solana RPC

#### Throws

Simulation failed error if the simulation fails

#### Example

```typescript
// Simulate a Solana transaction
try {
  const simulationResult = await txService.simulateTransaction({
    transaction: serializedTransaction,
    options: {
      skipPreflight: false,
      commitment: 'confirmed'
    }
  }, solanaProvider);

  if (simulationResult.err) {
    console.error('Transaction would fail:', simulationResult.err);
  } else {
    console.log('Transaction would succeed');
    console.log('Compute units consumed:', simulationResult.unitsConsumed);
  }
} catch (error) {
  console.error('Simulation error:', error);
}
```

***

### validateChainCompatibility()

> **validateChainCompatibility**(`_targetChainId`, `currentChainId`, `wallet`): `object`

Validate chain compatibility for transaction.

Checks if the current chain matches requirements for the transaction.
Can be extended to check wallet support for target chain.

#### Parameters

##### \_targetChainId

`string`

Desired chain for transaction (currently unused)

##### currentChainId

Currently connected chain

`null` | `string`

##### wallet

`unknown`

Wallet instance for capability checking

#### Returns

`object`

Validation result with error message if invalid

##### error?

> `optional` **error**: `string`

##### isValid

> **isValid**: `boolean`

#### Remarks

- Currently only checks for presence of chain ID
- Can be extended for cross-chain validation
- Target chain parameter reserved for future use

***

### validateConnectionState()

> **validateConnectionState**(`isConnected`, `chainId`, `chainType`, `wallet`): `object`

Validate connection state for transaction sending.

Ensures all required connection parameters are present before attempting
to send a transaction. Used by React hooks to provide early validation.

#### Parameters

##### isConnected

`boolean`

Whether wallet is connected

##### chainId

Current chain ID

`null` | `string`

##### chainType

Current chain type

`null` | `string`

##### wallet

`unknown`

Wallet instance

#### Returns

`object`

Validation result with error message if invalid

##### error?

> `optional` **error**: `string`

##### isValid

> **isValid**: `boolean`

#### Example

```typescript
const validation = txService.validateConnectionState(
  isConnected,
  chainId,
  chainType,
  wallet
);

if (!validation.isValid) {
  throw new Error(validation.error);
}
```

***

### validateGasEstimationParams()

> **validateGasEstimationParams**(`params`, `chainType`): `object`

Validate parameters for gas estimation.

Ensures required fields are present and chain type is compatible
with gas estimation functionality.

#### Parameters

##### params

[`EVMTransactionParams`](../interfaces/EVMTransactionParams.md)

EVM transaction parameters

##### chainType

Current chain type

`null` | `string`

#### Returns

`object`

Validation result with error message if invalid

##### error?

> `optional` **error**: `string`

##### isValid

> **isValid**: `boolean`

#### Remarks

- Gas estimation requires 'to' address
- Only supported for EVM chains
- Used by estimateGas method and React hooks

#### Example

```typescript
const validation = txService.validateGasEstimationParams(
  { to: '0x...', value: '1000' },
  'evm'
);

if (validation.isValid) {
  const estimate = await txService.estimateGas(params, provider);
}
```

***

### validateSimulationParams()

> **validateSimulationParams**(`params`, `chainType`): `object`

Validate parameters for transaction simulation.

Ensures Solana transaction data is present and chain type is compatible
with simulation functionality.

#### Parameters

##### params

[`SolanaTransactionParams`](../interfaces/SolanaTransactionParams.md)

Solana transaction parameters

##### chainType

Current chain type

`null` | `string`

#### Returns

`object`

Validation result with error message if invalid

##### error?

> `optional` **error**: `string`

##### isValid

> **isValid**: `boolean`

#### Remarks

- Simulation requires serialized transaction data
- Only supported for Solana chains
- Used by simulateTransaction method

#### Example

```typescript
const validation = txService.validateSimulationParams(
  { transaction: 'base64...', options: {} },
  'solana'
);

if (validation.isValid) {
  const result = await txService.simulateTransaction(params, provider);
}
```

***

### validateTransactionParams()

> **validateTransactionParams**(`params`, `chainType`): `object`

Validate transaction parameters for the current chain type.

Basic validation to ensure parameters are properly structured before
sending to the full validation pipeline.

#### Parameters

##### params

`unknown`

Transaction parameters to validate

##### chainType

Chain type for validation context

`null` | `string`

#### Returns

`object`

Validation result with error message if invalid

##### error?

> `optional` **error**: `string`

##### isValid

> **isValid**: `boolean`

#### Remarks

- This is a preliminary check before full validation
- Full validation happens in TransactionValidator
- Used by React hooks for early feedback

***

### waitForConfirmation()

> **waitForConfirmation**(`id`, `_confirmations`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`TransactionServiceReceipt`](../../../internal/types/typedocExports/interfaces/TransactionServiceReceipt.md)\>

Wait for transaction confirmation

Waits for a transaction to be confirmed on the blockchain. This method is also
available on the transaction result object returned by sendTransaction.

#### Parameters

##### id

`string`

The transaction ID to wait for

##### \_confirmations

`number` = `1`

Number of confirmations to wait for (currently unused, defaults to 1)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`TransactionServiceReceipt`](../../../internal/types/typedocExports/interfaces/TransactionServiceReceipt.md)\>

Promise resolving to the transaction receipt when confirmed

#### Throws

Not found error if transaction ID is invalid

#### Throws

Transaction failed error if the transaction fails

#### Throws

Timeout error if confirmation takes longer than configured timeout

#### Example

```typescript
// Wait using transaction ID
try {
  const receipt = await txService.waitForConfirmation('tx_1234567_abc');
  console.log(`Confirmed in block ${receipt.blockNumber}`);
} catch (error) {
  console.error('Transaction failed or timed out:', error);
}

// Preferred: use the wait method on transaction result
const result = await txService.sendTransaction(...);
const receipt = await result.wait();
```
