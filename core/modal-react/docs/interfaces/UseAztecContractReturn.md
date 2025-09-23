[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseAztecContractReturn

# Interface: UseAztecContractReturn\<T\>

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:20](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecContract.ts#L20)

Contract hook return type

## Type Parameters

### T

`T` = `unknown`

## Properties

### contract

> **contract**: `null` \| `T`

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:22](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecContract.ts#L22)

The contract instance, null if not loaded

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecContract.ts#L26)

Any error that occurred while loading

***

### execute()

> **execute**: (`interaction`) => `Promise`\<`unknown`\>

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:30](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecContract.ts#L30)

Execute a contract method with automatic wallet handling

#### Parameters

##### interaction

`unknown`

#### Returns

`Promise`\<`unknown`\>

***

### isLoading

> **isLoading**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecContract.ts#L24)

Whether the contract is currently loading

***

### refetch()

> **refetch**: () => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecContract.ts#L28)

Refetch the contract instance

#### Returns

`Promise`\<`void`\>

***

### simulate()

> **simulate**: (`method`) => `Promise`\<`unknown`\>

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:32](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecContract.ts#L32)

Simulate a contract method call

#### Parameters

##### method

`unknown`

#### Returns

`Promise`\<`unknown`\>
