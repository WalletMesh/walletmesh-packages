[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / SolanaWalletInfo

# Interface: SolanaWalletInfo

Defined in: [core/modal-react/src/hooks/useSolanaWallet.ts:23](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useSolanaWallet.ts#L23)

Consolidated Solana wallet information with both account and provider data

## Properties

### address

> **address**: `null` \| `string`

Defined in: [core/modal-react/src/hooks/useSolanaWallet.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useSolanaWallet.ts#L28)

Current account address

***

### chain

> **chain**: `null` \| \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}

Defined in: [core/modal-react/src/hooks/useSolanaWallet.ts:30](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useSolanaWallet.ts#L30)

Current chain information

***

### chainId

> **chainId**: `null` \| `string`

Defined in: [core/modal-react/src/hooks/useSolanaWallet.ts:32](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useSolanaWallet.ts#L32)

Current chain ID

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useSolanaWallet.ts:44](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useSolanaWallet.ts#L44)

Combined error from account or provider

***

### isConnected

> **isConnected**: `boolean`

Defined in: [core/modal-react/src/hooks/useSolanaWallet.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useSolanaWallet.ts#L26)

Whether wallet is connected

***

### isLoading

> **isLoading**: `boolean`

Defined in: [core/modal-react/src/hooks/useSolanaWallet.ts:42](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useSolanaWallet.ts#L42)

Whether currently initializing Solana provider

***

### isReady

> **isReady**: `boolean`

Defined in: [core/modal-react/src/hooks/useSolanaWallet.ts:40](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useSolanaWallet.ts#L40)

Whether Solana provider is ready for use

***

### isSolanaChain

> **isSolanaChain**: `boolean`

Defined in: [core/modal-react/src/hooks/useSolanaWallet.ts:50](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useSolanaWallet.ts#L50)

Whether on a Solana chain

***

### isTransacting

> **isTransacting**: `boolean`

Defined in: [core/modal-react/src/hooks/useSolanaWallet.ts:52](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useSolanaWallet.ts#L52)

Whether currently processing a transaction

***

### solanaProvider

> **solanaProvider**: `null` \| [`SolanaProvider`](SolanaProvider.md)

Defined in: [core/modal-react/src/hooks/useSolanaWallet.ts:38](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useSolanaWallet.ts#L38)

Solana provider instance with typed methods

***

### status

> **status**: `"connecting"` \| `"connected"` \| `"error"` \| `"disconnected"` \| `"ready"`

Defined in: [core/modal-react/src/hooks/useSolanaWallet.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useSolanaWallet.ts#L48)

Overall status combining connection and provider readiness

***

### wallet

> **wallet**: `null` \| [`WalletInfo`](WalletInfo.md)

Defined in: [core/modal-react/src/hooks/useSolanaWallet.ts:34](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useSolanaWallet.ts#L34)

Wallet information
