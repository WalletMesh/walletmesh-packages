[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseAztecBatchReturn

# Interface: UseAztecBatchReturn

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:73](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecBatch.ts#L73)

Batch transaction hook return type

## Properties

### batchMode

> **batchMode**: `null` \| `"atomic"` \| `"sequential"`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:84](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecBatch.ts#L84)

Current batch execution mode (null when not executing)

***

### clearStatuses()

> **clearStatuses**: () => `void`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:94](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecBatch.ts#L94)

Clear transaction statuses

#### Returns

`void`

***

### completedTransactions

> **completedTransactions**: `number`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:90](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecBatch.ts#L90)

Number of completed transactions

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:96](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecBatch.ts#L96)

Any overall batch error

***

### executeBatch()

> **executeBatch**: (`interactions`, `options?`) => `Promise`\<`TxReceipt`[]\>

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:75](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecBatch.ts#L75)

Execute a batch of transactions

#### Parameters

##### interactions

`ContractFunctionInteraction`[]

##### options?

`BatchSendOptions`

#### Returns

`Promise`\<`TxReceipt`[]\>

***

### failedTransactions

> **failedTransactions**: `number`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:92](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecBatch.ts#L92)

Number of failed transactions

***

### isExecuting

> **isExecuting**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:82](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecBatch.ts#L82)

Whether a batch is currently executing

***

### progress

> **progress**: `number`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:86](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecBatch.ts#L86)

Overall batch progress (0-100)

***

### totalTransactions

> **totalTransactions**: `number`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:88](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecBatch.ts#L88)

Total number of transactions in current batch

***

### transactionStatuses

> **transactionStatuses**: [`BatchTransactionStatus`](BatchTransactionStatus.md)[]

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:80](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecBatch.ts#L80)

Status of each transaction in the current/last batch
