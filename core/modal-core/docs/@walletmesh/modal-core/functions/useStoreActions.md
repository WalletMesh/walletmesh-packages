[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / useStoreActions

# Function: useStoreActions()

> **useStoreActions**(): `object`

Hook-style action access for React components

## Returns

`object`

### aztecTransactions

> **aztecTransactions**: `object` = `aztecTransactionActions`

#### aztecTransactions.addAztecTransaction()

> **addAztecTransaction**: (`store`, `transaction`) => `void`

Add an Aztec transaction to the store

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### transaction

[`AztecTransactionResult`](../interfaces/AztecTransactionResult.md)

##### Returns

`void`

#### aztecTransactions.addToBackgroundTransactions()

> **addToBackgroundTransactions**: (`store`, `txStatusId`) => `void`

Add a transaction to background mode

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### txStatusId

`string`

##### Returns

`void`

#### aztecTransactions.clearCompletedBackgroundTransactions()

> **clearCompletedBackgroundTransactions**: (`store`) => `void`

Clear all completed background transactions

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### Returns

`void`

#### aztecTransactions.endTransactionStage()

> **endTransactionStage**: (`store`, `txStatusId`, `stage`) => `void`

End a transaction stage (set end time)

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### txStatusId

`string`

###### stage

keyof [`TransactionStages`](../interfaces/TransactionStages.md)

##### Returns

`void`

#### aztecTransactions.failAllActiveTransactions()

> **failAllActiveTransactions**: (`store`, `reason`) => `void`

Fail all active Aztec transactions when session ends

Called when a wallet session is terminated or disconnected.
Marks all non-complete transactions as failed and removes them from background list.

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

Zustand store instance

###### reason

`string` = `'Session disconnected'`

Reason for session termination

##### Returns

`void`

#### aztecTransactions.removeAztecTransaction()

> **removeAztecTransaction**: (`store`, `txStatusId`) => `void`

Remove an Aztec transaction from the store

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### txStatusId

`string`

##### Returns

`void`

#### aztecTransactions.removeFromBackgroundTransactions()

> **removeFromBackgroundTransactions**: (`store`, `txStatusId`) => `void`

Remove a transaction from background mode

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### txStatusId

`string`

##### Returns

`void`

#### aztecTransactions.startTransactionStage()

> **startTransactionStage**: (`store`, `txStatusId`, `stage`) => `void`

Start a transaction stage (set start time)

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### txStatusId

`string`

###### stage

keyof [`TransactionStages`](../interfaces/TransactionStages.md)

##### Returns

`void`

#### aztecTransactions.updateAztecTransaction()

> **updateAztecTransaction**: (`store`, `txStatusId`, `updates`) => `void`

Update arbitrary transaction fields (txHash, receipt, etc.)

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### txStatusId

`string`

###### updates

`Partial`\<[`AztecTransactionResult`](../interfaces/AztecTransactionResult.md)\>

##### Returns

`void`

#### aztecTransactions.updateAztecTransactionStatus()

> **updateAztecTransactionStatus**: (`store`, `txStatusId`, `status`) => `void`

Update transaction status and stage timing

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### txStatusId

`string`

###### status

[`TransactionStatus`](../type-aliases/TransactionStatus.md)

##### Returns

`void`

#### aztecTransactions.updateTransactionStage()

> **updateTransactionStage**: (`store`, `txStatusId`, `stage`, `timing`) => `void`

Update stage timing for a transaction

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### txStatusId

`string`

###### stage

keyof [`TransactionStages`](../interfaces/TransactionStages.md)

###### timing

[`StageTiming`](../interfaces/StageTiming.md) | \{ `timestamp`: `number`; \}

##### Returns

`void`

### connections

> **connections**: `object` = `connectionActions`

#### connections.addDiscoveredWallet()

> **addDiscoveredWallet**: (`store`, `wallet`) => `void`

Add a discovered wallet to the state

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### wallet

[`WalletInfo`](../interfaces/WalletInfo.md)

##### Returns

`void`

#### connections.addWallet()

> **addWallet**: (`store`, `wallet`) => `void`

Add a wallet to the state

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### wallet

[`WalletInfo`](../interfaces/WalletInfo.md)

##### Returns

`void`

#### connections.clearAll()

> **clearAll**: (`store`) => `void`

Clear all connections

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### Returns

`void`

#### connections.createSession()

> **createSession**: (`store`, `params`) => [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SessionState`](../interfaces/SessionState.md)\>

Create a new session

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### params

[`CreateSessionParams`](../interfaces/CreateSessionParams.md)

##### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SessionState`](../interfaces/SessionState.md)\>

#### connections.endSession()

> **endSession**: (`store`, `sessionId`, `_options?`) => [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

End a session

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### sessionId

`string`

###### \_options?

###### isDisconnect?

`boolean`

##### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### connections.getActiveSession()

> **getActiveSession**: (`store`) => `null` \| [`SessionState`](../interfaces/SessionState.md)

Get active session from state

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### Returns

`null` \| [`SessionState`](../interfaces/SessionState.md)

#### connections.getSessionsByWallet()

> **getSessionsByWallet**: (`store`, `walletId`) => [`SessionState`](../interfaces/SessionState.md)[]

Get sessions by wallet ID

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### walletId

`string`

##### Returns

[`SessionState`](../interfaces/SessionState.md)[]

#### connections.getWalletSessions()

> **getWalletSessions**: (`store`, `walletId`) => [`SessionState`](../interfaces/SessionState.md)[]

Get wallet sessions (alias for getSessionsByWallet)

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### walletId

`string`

##### Returns

[`SessionState`](../interfaces/SessionState.md)[]

#### connections.markWalletAvailable()

> **markWalletAvailable**: (`store`, `walletId`) => `void`

Mark a wallet as available

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### walletId

`string`

##### Returns

`void`

#### connections.removeWallet()

> **removeWallet**: (`store`, `walletId`) => `void`

Remove a wallet from the state

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### walletId

`string`

##### Returns

`void`

#### connections.switchChain()

> **switchChain**: (`store`, `sessionId`, `chainId`) => [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`null` \| [`SessionState`](../interfaces/SessionState.md)\>

Switch chain for a session

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### sessionId

`string`

###### chainId

`string`

##### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`null` \| [`SessionState`](../interfaces/SessionState.md)\>

#### connections.switchToSession()

> **switchToSession**: (`store`, `sessionId`) => `void`

Switch to a different active session

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### sessionId

`string`

##### Returns

`void`

#### connections.updateSessionChain()

> **updateSessionChain**: (`store`, `sessionId`, `chain`) => `undefined` \| [`SessionState`](../interfaces/SessionState.md)

Update session chain

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### sessionId

`string`

###### chain

`Partial`\<[`ChainSessionInfo`](../interfaces/ChainSessionInfo.md)\>

##### Returns

`undefined` \| [`SessionState`](../interfaces/SessionState.md)

#### connections.updateSessionMetadata()

> **updateSessionMetadata**: (`store`, `sessionId`, `metadata`) => `void`

Update session metadata

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### sessionId

`string`

###### metadata

`Partial`\<[`SessionStateMetadata`](../interfaces/SessionStateMetadata.md)\>

##### Returns

`void`

#### connections.updateSessionStatus()

> **updateSessionStatus**: (`store`, `sessionId`, `status`) => `void`

Update session status

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### sessionId

`string`

###### status

`SessionStatus`

##### Returns

`void`

### transactions

> **transactions**: `object` = `transactionActions`

#### transactions.addTransaction()

> **addTransaction**: (`store`, `transaction`) => `void`

Add a transaction to normalized state

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### transaction

[`TransactionResult`](../interfaces/TransactionResult.md)

##### Returns

`void`

#### transactions.clearAllTransactions()

> **clearAllTransactions**: (`store`) => `void`

Clear all transactions from normalized state

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### Returns

`void`

#### transactions.clearError()

> **clearError**: (`store`) => `void`

Clear transaction error

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### Returns

`void`

#### transactions.confirmTransaction()

> **confirmTransaction**: (`store`, `txId`, `blockNumber?`, `blockHash?`) => `void`

Mark transaction as confirmed

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### txId

`string`

###### blockNumber?

`number`

###### blockHash?

`string`

##### Returns

`void`

#### transactions.failTransaction()

> **failTransaction**: (`store`, `txId`, `reason?`) => `void`

Mark transaction as failed

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### txId

`string`

###### reason?

`string`

##### Returns

`void`

#### transactions.getPendingTransactions()

> **getPendingTransactions**: (`store`) => [`TransactionResult`](../interfaces/TransactionResult.md)[]

Get pending transactions from normalized state

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### Returns

[`TransactionResult`](../interfaces/TransactionResult.md)[]

#### transactions.getTransaction()

> **getTransaction**: (`store`, `txId`) => `undefined` \| [`TransactionResult`](../interfaces/TransactionResult.md)

Get transaction by ID from normalized state (convenience method)

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### txId

`string`

##### Returns

`undefined` \| [`TransactionResult`](../interfaces/TransactionResult.md)

#### transactions.getTransactionHistory()

> **getTransactionHistory**: (`store`) => [`TransactionResult`](../interfaces/TransactionResult.md)[]

Get all transactions from normalized state (convenience method)

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### Returns

[`TransactionResult`](../interfaces/TransactionResult.md)[]

#### transactions.getTransactionsByStatus()

> **getTransactionsByStatus**: (`store`, `status`) => [`TransactionResult`](../interfaces/TransactionResult.md)[]

Get transactions by status from normalized state

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### status

[`TransactionStatus`](../type-aliases/TransactionStatus.md)

##### Returns

[`TransactionResult`](../interfaces/TransactionResult.md)[]

#### transactions.removeTransaction()

> **removeTransaction**: (`store`, `txId`) => `void`

Remove a transaction from normalized state

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### txId

`string`

##### Returns

`void`

#### transactions.setCurrentTransaction()

> **setCurrentTransaction**: (`store`, `transaction`) => `void`

Set the current active transaction in normalized state

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### transaction

`null` | [`TransactionResult`](../interfaces/TransactionResult.md)

##### Returns

`void`

#### transactions.setError()

> **setError**: (`store`, `error`) => `void`

Set transaction error in normalized state

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### error

`null` | [`TransactionError`](../../../internal/types/typedocExports/interfaces/TransactionError.md)

##### Returns

`void`

#### transactions.setStatus()

> **setStatus**: (`store`, `status`) => `void`

Set global transaction status

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### status

[`TransactionStatus`](../type-aliases/TransactionStatus.md)

##### Returns

`void`

#### transactions.updateTransaction()

> **updateTransaction**: (`store`, `txId`, `updates`) => `void`

Update an existing transaction in normalized state

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### txId

`string`

###### updates

`Partial`\<[`TransactionResult`](../interfaces/TransactionResult.md)\>

##### Returns

`void`

### ui

> **ui**: `object` = `uiActions`

#### ui.addDiscoveryError()

> **addDiscoveryError**: (`store`, `error`) => `void`

Add discovery error

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### error

`string`

##### Returns

`void`

#### ui.clearAllErrors()

> **clearAllErrors**: (`store`) => `void`

Clear all errors

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### Returns

`void`

#### ui.clearDiscoveryErrors()

> **clearDiscoveryErrors**: (`store`) => `void`

Clear discovery errors

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### Returns

`void`

#### ui.clearError()

> **clearError**: (`store`, `context`) => `void`

Clear error for a specific context

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### context

`string`

##### Returns

`void`

#### ui.clearViewHistory()

> **clearViewHistory**: (`store`) => `void`

Clear view history

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### Returns

`void`

#### ui.clearWalletFilter()

> **clearWalletFilter**: (`store`) => `void`

Clear wallet filter

Convenience method to clear the wallet filter.

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

The store instance

##### Returns

`void`

#### ui.closeModal()

> **closeModal**: (`store`) => `void`

Close the wallet connection modal

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### Returns

`void`

#### ui.goBack()

> **goBack**: (`store`) => `void`

Navigate back in modal view history

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### Returns

`void`

#### ui.openModal()

> **openModal**: (`store`, `targetChainType?`) => `void`

Open the wallet connection modal

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### targetChainType?

[`ChainType`](../enumerations/ChainType.md)

##### Returns

`void`

#### ui.setError()

> **setError**: (`store`, `context`, `error?`) => `void`

Set error state for a specific context

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### context

`string`

###### error?

###### category

`"user"` \| `"wallet"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"` = `errorCategorySchema`

Error category

###### cause?

`unknown` = `...`

Underlying cause of the error

###### classification?

`"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"` = `...`

Error classification for recovery purposes

###### code

`string` = `...`

Error code identifier

###### data?

`Record`\<`string`, `unknown`\> = `...`

Additional error data

###### maxRetries?

`number` = `...`

Maximum number of retry attempts

###### message

`string` = `...`

Human-readable error message

###### recoveryStrategy?

`"retry"` \| `"wait_and_retry"` \| `"manual_action"` \| `"none"` = `...`

Recovery strategy for this error
- 'retry': Can be retried immediately
- 'wait_and_retry': Should wait before retrying
- 'manual_action': Requires user intervention
- 'none': Not recoverable (fatal error)
- undefined: Not recoverable (default)

###### retryDelay?

`number` = `...`

Retry delay in milliseconds (for retry strategies)

##### Returns

`void`

#### ui.setLoading()

> **setLoading**: (`store`, `context`, `loading`) => `void`

Set loading state for a specific context

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### context

keyof [`LoadingState`](../interfaces/LoadingState.md)

###### loading

`boolean`

##### Returns

`void`

#### ui.setModalLoading()

> **setModalLoading**: (`store`, `loading`) => `void`

Set global modal loading state (convenience method)

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### loading

`boolean`

##### Returns

`void`

#### ui.setSessionError()

> **setSessionError**: (`store`, `error?`) => `void`

Set session error (convenience method)

Stores a session-related error in the UI state. This error will be
detected by the useSessionError hook in modal-react.

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### error?

###### category

`"user"` \| `"wallet"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"` = `errorCategorySchema`

Error category

###### cause?

`unknown` = `...`

Underlying cause of the error

###### classification?

`"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"` = `...`

Error classification for recovery purposes

###### code

`string` = `...`

Error code identifier

###### data?

`Record`\<`string`, `unknown`\> = `...`

Additional error data

###### maxRetries?

`number` = `...`

Maximum number of retry attempts

###### message

`string` = `...`

Human-readable error message

###### recoveryStrategy?

`"retry"` \| `"wait_and_retry"` \| `"manual_action"` \| `"none"` = `...`

Recovery strategy for this error
- 'retry': Can be retried immediately
- 'wait_and_retry': Should wait before retrying
- 'manual_action': Requires user intervention
- 'none': Not recoverable (fatal error)
- undefined: Not recoverable (default)

###### retryDelay?

`number` = `...`

Retry delay in milliseconds (for retry strategies)

##### Returns

`void`

#### ui.setSwitchingChainData()

> **setSwitchingChainData**: (`store`, `data?`) => `void`

Set chain switching data for UI display

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### data?

###### fromChain?

\{ `chainId`: `string`; `name?`: `string`; \}

###### fromChain.chainId

`string`

###### fromChain.name?

`string`

###### toChain?

\{ `chainId`: `string`; `name?`: `string`; \}

###### toChain.chainId

`string`

###### toChain.name?

`string`

##### Returns

`void`

#### ui.setTargetChainType()

> **setTargetChainType**: (`store`, `chainType?`) => `void`

Set target chain type for wallet filtering

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### chainType?

[`ChainType`](../enumerations/ChainType.md)

##### Returns

`void`

#### ui.setUIError()

> **setUIError**: (`store`, `error?`) => `void`

Set UI error (convenience method)

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### error?

###### category

`"user"` \| `"wallet"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"` = `errorCategorySchema`

Error category

###### cause?

`unknown` = `...`

Underlying cause of the error

###### classification?

`"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"` = `...`

Error classification for recovery purposes

###### code

`string` = `...`

Error code identifier

###### data?

`Record`\<`string`, `unknown`\> = `...`

Additional error data

###### maxRetries?

`number` = `...`

Maximum number of retry attempts

###### message

`string` = `...`

Human-readable error message

###### recoveryStrategy?

`"retry"` \| `"wait_and_retry"` \| `"manual_action"` \| `"none"` = `...`

Recovery strategy for this error
- 'retry': Can be retried immediately
- 'wait_and_retry': Should wait before retrying
- 'manual_action': Requires user intervention
- 'none': Not recoverable (fatal error)
- undefined: Not recoverable (default)

###### retryDelay?

`number` = `...`

Retry delay in milliseconds (for retry strategies)

##### Returns

`void`

#### ui.setView()

> **setView**: (`store`, `view`) => `void`

Set the current modal view

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

###### view

[`ModalView`](../type-aliases/ModalView.md)

##### Returns

`void`

#### ui.setWalletFilter()

> **setWalletFilter**: (`store`, `filter`) => `void`

Set wallet filter function

Sets a filter function to limit which wallets are shown in the modal.

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

The store instance

###### filter

Filter function or null to clear the filter

`null` | (`wallet`) => `boolean`

##### Returns

`void`

#### ui.startDiscovery()

> **startDiscovery**: (`store`) => `void`

Start wallet discovery scan

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### Returns

`void`

#### ui.stopDiscovery()

> **stopDiscovery**: (`store`) => `void`

Stop wallet discovery scan

##### Parameters

###### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### Returns

`void`

## Example

```tsx
function MyComponent() {
  const storeActions = useStoreActions();
  const store = useStore();

  const handleOpenModal = () => {
    storeActions.ui.openModal(store);
  };

  return <button onClick={handleOpenModal}>Open Modal</button>;
}
```
