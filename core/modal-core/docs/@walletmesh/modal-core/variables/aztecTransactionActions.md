[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / aztecTransactionActions

# Variable: aztecTransactionActions

> `const` **aztecTransactionActions**: `object`

Aztec transaction action functions

## Type Declaration

### addAztecTransaction()

> **addAztecTransaction**: (`store`, `transaction`) => `void`

Add an Aztec transaction to the store

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### transaction

[`AztecTransactionResult`](../interfaces/AztecTransactionResult.md)

#### Returns

`void`

### addToBackgroundTransactions()

> **addToBackgroundTransactions**: (`store`, `txStatusId`) => `void`

Add a transaction to background mode

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### txStatusId

`string`

#### Returns

`void`

### clearCompletedBackgroundTransactions()

> **clearCompletedBackgroundTransactions**: (`store`) => `void`

Clear all completed background transactions

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`void`

### endTransactionStage()

> **endTransactionStage**: (`store`, `txStatusId`, `stage`) => `void`

End a transaction stage (set end time)

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### txStatusId

`string`

##### stage

keyof [`TransactionStages`](../interfaces/TransactionStages.md)

#### Returns

`void`

### failAllActiveTransactions()

> **failAllActiveTransactions**: (`store`, `reason`) => `void`

Fail all active Aztec transactions when session ends

Called when a wallet session is terminated or disconnected.
Marks all non-complete transactions as failed and removes them from background list.

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

Zustand store instance

##### reason

`string` = `'Session disconnected'`

Reason for session termination

#### Returns

`void`

### removeAztecTransaction()

> **removeAztecTransaction**: (`store`, `txStatusId`) => `void`

Remove an Aztec transaction from the store

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### txStatusId

`string`

#### Returns

`void`

### removeFromBackgroundTransactions()

> **removeFromBackgroundTransactions**: (`store`, `txStatusId`) => `void`

Remove a transaction from background mode

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### txStatusId

`string`

#### Returns

`void`

### startTransactionStage()

> **startTransactionStage**: (`store`, `txStatusId`, `stage`) => `void`

Start a transaction stage (set start time)

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### txStatusId

`string`

##### stage

keyof [`TransactionStages`](../interfaces/TransactionStages.md)

#### Returns

`void`

### updateAztecTransaction()

> **updateAztecTransaction**: (`store`, `txStatusId`, `updates`) => `void`

Update arbitrary transaction fields (txHash, receipt, etc.)

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### txStatusId

`string`

##### updates

`Partial`\<[`AztecTransactionResult`](../interfaces/AztecTransactionResult.md)\>

#### Returns

`void`

### updateAztecTransactionStatus()

> **updateAztecTransactionStatus**: (`store`, `txStatusId`, `status`) => `void`

Update transaction status and stage timing

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### txStatusId

`string`

##### status

[`TransactionStatus`](../type-aliases/TransactionStatus.md)

#### Returns

`void`

### updateTransactionStage()

> **updateTransactionStage**: (`store`, `txStatusId`, `stage`, `timing`) => `void`

Update stage timing for a transaction

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### txStatusId

`string`

##### stage

keyof [`TransactionStages`](../interfaces/TransactionStages.md)

##### timing

[`StageTiming`](../interfaces/StageTiming.md) | \{ `timestamp`: `number`; \}

#### Returns

`void`
