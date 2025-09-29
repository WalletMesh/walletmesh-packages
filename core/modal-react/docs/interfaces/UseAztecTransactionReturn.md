[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseAztecTransactionReturn

# Interface: UseAztecTransactionReturn

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:52](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecTransaction.ts#L52)

Transaction hook return type

## Properties

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:63](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecTransaction.ts#L63)

Any error that occurred

***

### execute()

> **execute**: (`transactionBuilder`, `options?`) => `Promise`\<[`AztecTransactionResult`](AztecTransactionResult.md)\>

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:54](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecTransaction.ts#L54)

Execute a transaction with automatic handling

#### Parameters

##### transactionBuilder

(`wallet`) => `Promise`\<`unknown`\>

##### options?

[`TransactionOptions`](TransactionOptions.md)

#### Returns

`Promise`\<[`AztecTransactionResult`](AztecTransactionResult.md)\>

***

### isExecuting

> **isExecuting**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:59](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecTransaction.ts#L59)

Whether a transaction is currently executing

***

### lastResult

> **lastResult**: `null` \| [`AztecTransactionResult`](AztecTransactionResult.md)

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:67](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecTransaction.ts#L67)

Last transaction result

***

### provingProgress

> **provingProgress**: `number`

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:69](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecTransaction.ts#L69)

Current proving progress (0-100)

***

### reset()

> **reset**: () => `void`

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:65](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecTransaction.ts#L65)

Reset the transaction state

#### Returns

`void`

***

### status

> **status**: `"error"` \| `"proving"` \| `"idle"` \| `"preparing"` \| `"confirming"` \| `"success"` \| `"sending"`

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:61](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecTransaction.ts#L61)

Current transaction status
