[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / transactionActions

# Variable: transactionActions

> `const` **transactionActions**: `object`

Transaction action functions

## Type Declaration

### addTransaction()

> **addTransaction**: (`store`, `transaction`) => `void`

Add a transaction to normalized state

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### transaction

[`TransactionResult`](../interfaces/TransactionResult.md)

#### Returns

`void`

### clearAllTransactions()

> **clearAllTransactions**: (`store`) => `void`

Clear all transactions from normalized state

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`void`

### clearError()

> **clearError**: (`store`) => `void`

Clear transaction error

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`void`

### confirmTransaction()

> **confirmTransaction**: (`store`, `txId`, `blockNumber?`, `blockHash?`) => `void`

Mark transaction as confirmed

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### txId

`string`

##### blockNumber?

`number`

##### blockHash?

`string`

#### Returns

`void`

### failTransaction()

> **failTransaction**: (`store`, `txId`, `reason?`) => `void`

Mark transaction as failed

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### txId

`string`

##### reason?

`string`

#### Returns

`void`

### getPendingTransactions()

> **getPendingTransactions**: (`store`) => [`TransactionResult`](../interfaces/TransactionResult.md)[]

Get pending transactions from normalized state

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

[`TransactionResult`](../interfaces/TransactionResult.md)[]

### getTransaction()

> **getTransaction**: (`store`, `txId`) => `undefined` \| [`TransactionResult`](../interfaces/TransactionResult.md)

Get transaction by ID from normalized state (convenience method)

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### txId

`string`

#### Returns

`undefined` \| [`TransactionResult`](../interfaces/TransactionResult.md)

### getTransactionHistory()

> **getTransactionHistory**: (`store`) => [`TransactionResult`](../interfaces/TransactionResult.md)[]

Get all transactions from normalized state (convenience method)

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

[`TransactionResult`](../interfaces/TransactionResult.md)[]

### getTransactionsByStatus()

> **getTransactionsByStatus**: (`store`, `status`) => [`TransactionResult`](../interfaces/TransactionResult.md)[]

Get transactions by status from normalized state

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### status

[`TransactionStatus`](../type-aliases/TransactionStatus.md)

#### Returns

[`TransactionResult`](../interfaces/TransactionResult.md)[]

### removeTransaction()

> **removeTransaction**: (`store`, `txId`) => `void`

Remove a transaction from normalized state

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### txId

`string`

#### Returns

`void`

### setCurrentTransaction()

> **setCurrentTransaction**: (`store`, `transaction`) => `void`

Set the current active transaction in normalized state

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### transaction

`null` | [`TransactionResult`](../interfaces/TransactionResult.md)

#### Returns

`void`

### setError()

> **setError**: (`store`, `error`) => `void`

Set transaction error in normalized state

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### error

`null` | [`TransactionError`](../../../internal/types/typedocExports/interfaces/TransactionError.md)

#### Returns

`void`

### setStatus()

> **setStatus**: (`store`, `status`) => `void`

Set global transaction status

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### status

[`TransactionStatus`](../type-aliases/TransactionStatus.md)

#### Returns

`void`

### updateTransaction()

> **updateTransaction**: (`store`, `txId`, `updates`) => `void`

Update an existing transaction in normalized state

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### txId

`string`

##### updates

`Partial`\<[`TransactionResult`](../interfaces/TransactionResult.md)\>

#### Returns

`void`
