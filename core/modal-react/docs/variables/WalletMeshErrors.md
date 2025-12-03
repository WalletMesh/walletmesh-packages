[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshErrors

# Variable: WalletMeshErrors

> `const` **WalletMeshErrors**: `object`

Defined in: [core/modal-react/src/types/errors.ts:75](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types/errors.ts#L75)

## Type Declaration

### chainMismatch()

> `readonly` **chainMismatch**: (`expected`, `actual`) => [`WalletMeshError`](../interfaces/WalletMeshError.md)

#### Parameters

##### expected

`string`

##### actual

`string`

#### Returns

[`WalletMeshError`](../interfaces/WalletMeshError.md)

### connectionFailed()

> `readonly` **connectionFailed**: (`reason`, `details?`) => [`WalletMeshError`](../interfaces/WalletMeshError.md)

#### Parameters

##### reason

`string`

##### details?

`unknown`

#### Returns

[`WalletMeshError`](../interfaces/WalletMeshError.md)

### insufficientFunds()

> `readonly` **insufficientFunds**: (`required`, `available`) => [`WalletMeshError`](../interfaces/WalletMeshError.md)

#### Parameters

##### required

`string`

##### available

`string`

#### Returns

[`WalletMeshError`](../interfaces/WalletMeshError.md)

### notConnected()

> `readonly` **notConnected**: () => [`WalletMeshError`](../interfaces/WalletMeshError.md)

#### Returns

[`WalletMeshError`](../interfaces/WalletMeshError.md)

### providerNotFound()

> `readonly` **providerNotFound**: () => [`WalletMeshError`](../interfaces/WalletMeshError.md)

#### Returns

[`WalletMeshError`](../interfaces/WalletMeshError.md)

### transactionFailed()

> `readonly` **transactionFailed**: (`reason`, `txHash?`) => [`WalletMeshError`](../interfaces/WalletMeshError.md)

#### Parameters

##### reason

`string`

##### txHash?

`string`

#### Returns

[`WalletMeshError`](../interfaces/WalletMeshError.md)

### userRejected()

> `readonly` **userRejected**: (`details?`) => [`WalletMeshError`](../interfaces/WalletMeshError.md)

#### Parameters

##### details?

`unknown`

#### Returns

[`WalletMeshError`](../interfaces/WalletMeshError.md)

### walletNotFound()

> `readonly` **walletNotFound**: (`walletId`) => [`WalletMeshError`](../interfaces/WalletMeshError.md)

#### Parameters

##### walletId

`string`

#### Returns

[`WalletMeshError`](../interfaces/WalletMeshError.md)

### walletNotInstalled()

> `readonly` **walletNotInstalled**: (`walletName`) => [`WalletMeshError`](../interfaces/WalletMeshError.md)

#### Parameters

##### walletName

`string`

#### Returns

[`WalletMeshError`](../interfaces/WalletMeshError.md)
