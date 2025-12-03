[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AztecWalletInfo

# Interface: AztecWalletInfo

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:82](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecWallet.ts#L82)

Consolidated Aztec wallet information with both account and provider data

## Properties

### address

> **address**: `null` \| `string`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:87](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecWallet.ts#L87)

Current account address

***

### aztecWallet

> **aztecWallet**: `null` \| `AztecDappWallet`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:97](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecWallet.ts#L97)

Aztec wallet instance with typed methods

***

### chain

> **chain**: `null` \| \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:89](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecWallet.ts#L89)

Current chain information

***

### chainId

> **chainId**: `null` \| `string`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:91](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecWallet.ts#L91)

Current chain ID

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:103](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecWallet.ts#L103)

Combined error from account or provider

***

### isAvailable

> **isAvailable**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:107](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecWallet.ts#L107)

Whether wallet is available

***

### isAztecChain

> **isAztecChain**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:115](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecWallet.ts#L115)

Whether on an Aztec chain

***

### isConnected

> **isConnected**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:85](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecWallet.ts#L85)

Whether wallet is connected

***

### isLoading

> **isLoading**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:101](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecWallet.ts#L101)

Whether currently initializing Aztec wallet

***

### isReady

> **isReady**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:99](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecWallet.ts#L99)

Whether Aztec wallet is ready for use

***

### status

> **status**: `"connecting"` \| `"connected"` \| `"error"` \| `"disconnected"` \| `"ready"`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:113](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecWallet.ts#L113)

Overall status combining connection and wallet readiness

***

### wallet

> **wallet**: `null` \| [`WalletInfo`](WalletInfo.md)

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:93](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecWallet.ts#L93)

Wallet information

***

### walletId

> **walletId**: `null` \| `string`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:109](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecWallet.ts#L109)

Wallet ID providing this provider
