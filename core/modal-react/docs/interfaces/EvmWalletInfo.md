[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / EvmWalletInfo

# Interface: EvmWalletInfo

Defined in: [core/modal-react/src/hooks/useEvmWallet.ts:23](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useEvmWallet.ts#L23)

Consolidated EVM wallet information with both account and provider data

## Properties

### address

> **address**: `null` \| `string`

Defined in: [core/modal-react/src/hooks/useEvmWallet.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useEvmWallet.ts#L28)

Current account address

***

### chain

> **chain**: `null` \| \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}

Defined in: [core/modal-react/src/hooks/useEvmWallet.ts:30](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useEvmWallet.ts#L30)

Current chain information

***

### chainId

> **chainId**: `null` \| `string`

Defined in: [core/modal-react/src/hooks/useEvmWallet.ts:32](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useEvmWallet.ts#L32)

Current chain ID

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useEvmWallet.ts:44](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useEvmWallet.ts#L44)

Combined error from account or provider

***

### evmProvider

> **evmProvider**: `null` \| [`EVMProvider`](EVMProvider.md)

Defined in: [core/modal-react/src/hooks/useEvmWallet.ts:38](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useEvmWallet.ts#L38)

EVM provider instance with typed methods

***

### isConnected

> **isConnected**: `boolean`

Defined in: [core/modal-react/src/hooks/useEvmWallet.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useEvmWallet.ts#L26)

Whether wallet is connected

***

### isEvmChain

> **isEvmChain**: `boolean`

Defined in: [core/modal-react/src/hooks/useEvmWallet.ts:50](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useEvmWallet.ts#L50)

Whether on an EVM chain

***

### isLoading

> **isLoading**: `boolean`

Defined in: [core/modal-react/src/hooks/useEvmWallet.ts:42](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useEvmWallet.ts#L42)

Whether currently initializing EVM provider

***

### isReady

> **isReady**: `boolean`

Defined in: [core/modal-react/src/hooks/useEvmWallet.ts:40](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useEvmWallet.ts#L40)

Whether EVM provider is ready for use

***

### isTransacting

> **isTransacting**: `boolean`

Defined in: [core/modal-react/src/hooks/useEvmWallet.ts:52](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useEvmWallet.ts#L52)

Whether currently processing a transaction

***

### status

> **status**: `"connecting"` \| `"connected"` \| `"error"` \| `"disconnected"` \| `"ready"`

Defined in: [core/modal-react/src/hooks/useEvmWallet.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useEvmWallet.ts#L48)

Overall status combining connection and provider readiness

***

### wallet

> **wallet**: `null` \| [`WalletInfo`](WalletInfo.md)

Defined in: [core/modal-react/src/hooks/useEvmWallet.ts:34](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useEvmWallet.ts#L34)

Wallet information
