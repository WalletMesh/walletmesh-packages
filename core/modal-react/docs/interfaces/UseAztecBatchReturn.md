[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseAztecBatchReturn

# Interface: UseAztecBatchReturn

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:38](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecBatch.ts#L38)

Batch transaction hook return type

## Properties

### clearStatuses()

> **clearStatuses**: () => `void`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:54](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecBatch.ts#L54)

Clear transaction statuses

#### Returns

`void`

***

### completedTransactions

> **completedTransactions**: `number`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:50](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecBatch.ts#L50)

Number of completed transactions

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:56](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecBatch.ts#L56)

Any overall batch error

***

### executeBatch()

> **executeBatch**: (`interactions`) => `Promise`\<`TxReceipt`[]\>

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:40](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecBatch.ts#L40)

Execute a batch of transactions

#### Parameters

##### interactions

`ContractFunctionInteraction`[]

#### Returns

`Promise`\<`TxReceipt`[]\>

***

### failedTransactions

> **failedTransactions**: `number`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:52](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecBatch.ts#L52)

Number of failed transactions

***

### isExecuting

> **isExecuting**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:44](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecBatch.ts#L44)

Whether a batch is currently executing

***

### progress

> **progress**: `number`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:46](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecBatch.ts#L46)

Overall batch progress (0-100)

***

### totalTransactions

> **totalTransactions**: `number`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecBatch.ts#L48)

Total number of transactions in current batch

***

### transactionStatuses

> **transactionStatuses**: [`BatchTransactionStatus`](BatchTransactionStatus.md)[]

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:42](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecBatch.ts#L42)

Status of each transaction in the current/last batch
