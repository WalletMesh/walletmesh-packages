[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / TransactionOptions

# Interface: TransactionOptions

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:20](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecTransaction.ts#L20)

Transaction execution options

## Properties

### autoCheckStatus?

> `optional` **autoCheckStatus**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:30](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecTransaction.ts#L30)

Whether to automatically check status

***

### onError()?

> `optional` **onError**: (`error`) => `void`

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecTransaction.ts#L26)

Callback when transaction fails

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### onProvingProgress()?

> `optional` **onProvingProgress**: (`progress`) => `void`

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecTransaction.ts#L28)

Callback for proving progress

#### Parameters

##### progress

`number`

#### Returns

`void`

***

### onSent()?

> `optional` **onSent**: (`txHash`) => `void`

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:22](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecTransaction.ts#L22)

Callback when transaction is sent

#### Parameters

##### txHash

`string`

#### Returns

`void`

***

### onSuccess()?

> `optional` **onSuccess**: (`receipt`) => `void`

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecTransaction.ts#L24)

Callback when transaction succeeds

#### Parameters

##### receipt

`unknown`

#### Returns

`void`
