[**@walletmesh/modal v0.0.6**](../../../README.md)

***

[@walletmesh/modal](../../../modules.md) / [components/WalletProvider](../README.md) / WalletProviderProps

# Interface: WalletProviderProps

Defined in: [core/modal/src/components/WalletProvider.tsx:16](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/components/WalletProvider.tsx#L16)

Props for the WalletProvider component
 WalletProviderProps

## Properties

### children

> **children**: `ReactNode`

Defined in: [core/modal/src/components/WalletProvider.tsx:17](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/components/WalletProvider.tsx#L17)

Child components to render inside the provider

***

### config

> **config**: [`WalletMeshProviderConfig`](../../../index/interfaces/WalletMeshProviderConfig.md)

Defined in: [core/modal/src/components/WalletProvider.tsx:18](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/components/WalletProvider.tsx#L18)

WalletMesh configuration including wallet and dapp settings

***

### onError()?

> `optional` **onError**: (`error`) => `void`

Defined in: [core/modal/src/components/WalletProvider.tsx:19](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/components/WalletProvider.tsx#L19)

Optional error handler for wallet-related errors

#### Parameters

##### error

`Error`

#### Returns

`void`
