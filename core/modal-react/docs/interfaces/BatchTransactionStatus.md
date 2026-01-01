[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / BatchTransactionStatus

# Interface: BatchTransactionStatus

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:29](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecBatch.ts#L29)

Batch transaction status for individual transactions

## Properties

### error?

> `optional` **error**: `Error`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:39](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecBatch.ts#L39)

Error if transaction failed

***

### hash?

> `optional` **hash**: `string`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:35](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecBatch.ts#L35)

Transaction hash if available

***

### index

> **index**: `number`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:31](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecBatch.ts#L31)

Index of the transaction in the batch

***

### receipt?

> `optional` **receipt**: `TxReceipt`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:37](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecBatch.ts#L37)

Receipt if transaction completed

***

### status

> **status**: `"error"` \| `"sending"` \| `"pending"` \| `"confirming"` \| `"success"`

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:33](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecBatch.ts#L33)

Current status of the transaction
