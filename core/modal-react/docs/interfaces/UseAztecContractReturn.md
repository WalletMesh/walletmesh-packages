[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseAztecContractReturn

# Interface: UseAztecContractReturn\<T\>

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecContract.ts#L24)

Contract hook return type

## Type Parameters

### T

`T` = `unknown`

## Properties

### contract

> **contract**: `null` \| `T`

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecContract.ts#L26)

The contract instance, null if not loaded. Use native Aztec.js methods: contract.methods.methodName(...).send() or .simulate()

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:30](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecContract.ts#L30)

Any error that occurred while loading

***

### isDeploymentPending

> **isDeploymentPending**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:32](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecContract.ts#L32)

Whether a deployment for this address is pending confirmation

***

### isLoading

> **isLoading**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecContract.ts#L28)

Whether the contract is currently loading

***

### refetch()

> **refetch**: () => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:34](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecContract.ts#L34)

Refetch the contract instance

#### Returns

`Promise`\<`void`\>
