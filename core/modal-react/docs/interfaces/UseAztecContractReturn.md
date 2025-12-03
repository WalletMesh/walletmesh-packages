[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseAztecContractReturn

# Interface: UseAztecContractReturn\<T\>

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:21](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecContract.ts#L21)

Contract hook return type

## Type Parameters

### T

`T` = `unknown`

## Properties

### contract

> **contract**: `null` \| `T`

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:23](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecContract.ts#L23)

The contract instance, null if not loaded

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecContract.ts#L27)

Any error that occurred while loading

***

### execute()

> **execute**: (`interaction`) => `Promise`\<`unknown`\>

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:31](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecContract.ts#L31)

Execute a contract method with automatic wallet handling

#### Parameters

##### interaction

`unknown`

#### Returns

`Promise`\<`unknown`\>

***

### isLoading

> **isLoading**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:25](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecContract.ts#L25)

Whether the contract is currently loading

***

### refetch()

> **refetch**: () => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:29](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecContract.ts#L29)

Refetch the contract instance

#### Returns

`Promise`\<`void`\>

***

### simulate()

> **simulate**: (`method`) => `Promise`\<`unknown`\>

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:33](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecContract.ts#L33)

Simulate a contract method call

#### Parameters

##### method

`unknown`

#### Returns

`Promise`\<`unknown`\>
