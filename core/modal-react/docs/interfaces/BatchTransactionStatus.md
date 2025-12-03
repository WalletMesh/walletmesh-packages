[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / BatchTransactionStatus

# Interface: BatchTransactionStatus

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:20](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecBatch.ts#L20)

Batch transaction status for individual transactions

## Properties

### error?

> `optional` **error**: `Error`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:30](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecBatch.ts#L30)

Error if transaction failed

***

### hash?

> `optional` **hash**: `string`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecBatch.ts#L26)

Transaction hash if available

***

### index

> **index**: `number`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:22](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecBatch.ts#L22)

Index of the transaction in the batch

***

### receipt?

> `optional` **receipt**: `TxReceipt`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecBatch.ts#L28)

Receipt if transaction completed

***

### status

> **status**: `"error"` \| `"confirming"` \| `"success"` \| `"pending"` \| `"sending"`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecBatch.ts#L24)

Current status of the transaction
