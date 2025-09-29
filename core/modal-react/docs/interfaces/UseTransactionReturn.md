[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseTransactionReturn

# Interface: UseTransactionReturn

Defined in: [core/modal-react/src/hooks/useTransaction.ts:56](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useTransaction.ts#L56)

Hook return type

## Properties

### currentTransaction

> **currentTransaction**: `null` \| [`CoreTransactionResult`](CoreTransactionResult.md)

Defined in: [core/modal-react/src/hooks/useTransaction.ts:64](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useTransaction.ts#L64)

Current transaction being processed

***

### error

> **error**: `null` \| [`TransactionError`](TransactionError.md)

Defined in: [core/modal-react/src/hooks/useTransaction.ts:79](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useTransaction.ts#L79)

Error from last transaction

***

### estimateGas()

> **estimateGas**: (`params`) => `Promise`\<`string`\>

Defined in: [core/modal-react/src/hooks/useTransaction.ts:94](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useTransaction.ts#L94)

Estimate gas for transaction (EVM only)

#### Parameters

##### params

[`EVMTransactionParams`](EVMTransactionParams.md)

#### Returns

`Promise`\<`string`\>

***

### getTransaction()

> **getTransaction**: (`hash`) => `undefined` \| [`CoreTransactionResult`](CoreTransactionResult.md)

Defined in: [core/modal-react/src/hooks/useTransaction.ts:85](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useTransaction.ts#L85)

Get transaction by hash

#### Parameters

##### hash

`string`

#### Returns

`undefined` \| [`CoreTransactionResult`](CoreTransactionResult.md)

***

### getTransactionById()

> **getTransactionById**: (`txId`) => `undefined` \| [`CoreTransactionResult`](CoreTransactionResult.md)

Defined in: [core/modal-react/src/hooks/useTransaction.ts:88](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useTransaction.ts#L88)

Get transaction by ID

#### Parameters

##### txId

`string`

#### Returns

`undefined` \| [`CoreTransactionResult`](CoreTransactionResult.md)

***

### isLoading

> **isLoading**: `boolean`

Defined in: [core/modal-react/src/hooks/useTransaction.ts:70](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useTransaction.ts#L70)

Whether a transaction is in progress

***

### isPending

> **isPending**: `boolean`

Defined in: [core/modal-react/src/hooks/useTransaction.ts:73](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useTransaction.ts#L73)

Whether a transaction is pending (from mutation)

***

### reset()

> **reset**: () => `void`

Defined in: [core/modal-react/src/hooks/useTransaction.ts:82](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useTransaction.ts#L82)

Reset error state

#### Returns

`void`

***

### sendTransaction()

> **sendTransaction**: (`params`) => `Promise`\<[`CoreTransactionResult`](CoreTransactionResult.md)\>

Defined in: [core/modal-react/src/hooks/useTransaction.ts:58](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useTransaction.ts#L58)

Send a transaction

#### Parameters

##### params

[`TransactionRequest`](../type-aliases/TransactionRequest.md)

#### Returns

`Promise`\<[`CoreTransactionResult`](CoreTransactionResult.md)\>

***

### sendTransactionAsync()

> **sendTransactionAsync**: (`params`) => `Promise`\<[`CoreTransactionResult`](CoreTransactionResult.md)\>

Defined in: [core/modal-react/src/hooks/useTransaction.ts:61](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useTransaction.ts#L61)

Mutate async for direct access to mutation

#### Parameters

##### params

[`TransactionRequest`](../type-aliases/TransactionRequest.md)

#### Returns

`Promise`\<[`CoreTransactionResult`](CoreTransactionResult.md)\>

***

### simulateTransaction()

> **simulateTransaction**: (`params`) => `Promise`\<`unknown`\>

Defined in: [core/modal-react/src/hooks/useTransaction.ts:97](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useTransaction.ts#L97)

Simulate transaction (Solana only)

#### Parameters

##### params

[`SolanaTransactionParams`](SolanaTransactionParams.md)

#### Returns

`Promise`\<`unknown`\>

***

### status

> **status**: [`TransactionStatus`](../type-aliases/TransactionStatus.md)

Defined in: [core/modal-react/src/hooks/useTransaction.ts:76](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useTransaction.ts#L76)

Current transaction status

***

### transactions

> **transactions**: [`CoreTransactionResult`](CoreTransactionResult.md)[]

Defined in: [core/modal-react/src/hooks/useTransaction.ts:67](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useTransaction.ts#L67)

Transaction history for this session

***

### waitForConfirmation()

> **waitForConfirmation**: (`hash`, `confirmations?`) => `Promise`\<[`CoreTransactionResult`](CoreTransactionResult.md)\>

Defined in: [core/modal-react/src/hooks/useTransaction.ts:91](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useTransaction.ts#L91)

Wait for transaction confirmation

#### Parameters

##### hash

`string`

##### confirmations?

`number`

#### Returns

`Promise`\<[`CoreTransactionResult`](CoreTransactionResult.md)\>
