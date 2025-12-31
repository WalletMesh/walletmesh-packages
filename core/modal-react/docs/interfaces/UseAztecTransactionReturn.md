[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseAztecTransactionReturn

# Interface: UseAztecTransactionReturn

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:33](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecTransaction.ts#L33)

Hook return type following Wagmi pattern

## Properties

### activeTransaction

> **activeTransaction**: `null` \| [`AztecTransactionResult`](AztecTransactionResult.md)

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:42](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecTransaction.ts#L42)

Currently active transaction (sync mode)

***

### backgroundCount

> **backgroundCount**: `number`

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:60](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecTransaction.ts#L60)

Number of active background transactions

***

### backgroundTransactions

> **backgroundTransactions**: [`AztecTransactionResult`](AztecTransactionResult.md)[]

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:58](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecTransaction.ts#L58)

All background transactions (async mode)

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecTransaction.ts#L48)

Error from last transaction

***

### execute()

> **execute**: (`interaction`, `callbacks?`) => `Promise`\<`string`\>

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:36](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecTransaction.ts#L36)

Execute transaction asynchronously in background (returns immediately with txId)

#### Parameters

##### interaction

`ContractFunctionInteraction`

##### callbacks?

[`TransactionCallbacks`](TransactionCallbacks.md)

#### Returns

`Promise`\<`string`\>

***

### executeSync()

> **executeSync**: (`interaction`) => `Promise`\<`unknown`\>

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:38](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecTransaction.ts#L38)

Execute transaction synchronously with blocking overlay (waits for completion)

#### Parameters

##### interaction

`ContractFunctionInteraction`

#### Returns

`Promise`\<`unknown`\>

***

### getTransaction()

> **getTransaction**: (`txId`) => `undefined` \| [`AztecTransactionResult`](AztecTransactionResult.md)

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:64](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecTransaction.ts#L64)

Get transaction by ID

#### Parameters

##### txId

`string`

#### Returns

`undefined` \| [`AztecTransactionResult`](AztecTransactionResult.md)

***

### isExecuting

> **isExecuting**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:54](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecTransaction.ts#L54)

Combined execution state - true if any transaction operation is in progress

***

### isLoading

> **isLoading**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:44](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecTransaction.ts#L44)

Whether a sync transaction is currently executing (legacy)

***

### isWalletInteracting

> **isWalletInteracting**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:52](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecTransaction.ts#L52)

Whether the hook is currently waiting for wallet interaction (approval/signing)

***

### reset()

> **reset**: () => `void`

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:66](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecTransaction.ts#L66)

Reset error state

#### Returns

`void`

***

### status

> **status**: [`TransactionStatus`](../type-aliases/TransactionStatus.md)

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:46](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecTransaction.ts#L46)

Current transaction status
