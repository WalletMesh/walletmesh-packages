[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletProviderInfo

# Interface: WalletProviderInfo\<T\>

Defined in: [core/modal-react/src/hooks/useWalletProvider.ts:20](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletProvider.ts#L20)

Wallet provider information with type safety

## Type Parameters

### T

`T` *extends* [`WalletProvider`](WalletProvider.md) = [`WalletProvider`](WalletProvider.md)

## Properties

### chain

> **chain**: `null` \| \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}

Defined in: [core/modal-react/src/hooks/useWalletProvider.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletProvider.ts#L28)

Chain this provider is for

***

### chainType

> **chainType**: `null` \| [`ChainType`](../enumerations/ChainType.md)

Defined in: [core/modal-react/src/hooks/useWalletProvider.ts:30](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletProvider.ts#L30)

Chain type (evm, solana, aztec)

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useWalletProvider.ts:34](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletProvider.ts#L34)

Connection error if any

***

### isAvailable

> **isAvailable**: `boolean`

Defined in: [core/modal-react/src/hooks/useWalletProvider.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletProvider.ts#L24)

Whether provider is available

***

### isConnecting

> **isConnecting**: `boolean`

Defined in: [core/modal-react/src/hooks/useWalletProvider.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletProvider.ts#L26)

Whether currently connecting

***

### provider

> **provider**: `null` \| `T`

Defined in: [core/modal-react/src/hooks/useWalletProvider.ts:22](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletProvider.ts#L22)

The wallet provider instance

***

### walletId

> **walletId**: `null` \| `string`

Defined in: [core/modal-react/src/hooks/useWalletProvider.ts:32](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletProvider.ts#L32)

Wallet ID providing this provider
