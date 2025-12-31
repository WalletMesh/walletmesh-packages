[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AztecWalletInfo

# Interface: AztecWalletInfo

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:98](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L98)

Consolidated Aztec wallet information with both account and provider data

## Properties

### accounts

> **accounts**: `AccountInfo`[]

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:117](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L117)

List of all registered accounts (requires wallet support)

***

### activeAccount

> **activeAccount**: `null` \| `AccountInfo`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:119](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L119)

The currently active account

***

### address

> **address**: `null` \| `string`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:103](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L103)

Current account address

***

### addressAztec

> **addressAztec**: `null` \| `AztecAddress`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:105](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L105)

Current account address as AztecAddress

***

### addressString

> **addressString**: `null` \| `string`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:107](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L107)

Canonical hex string representation of the account address

***

### aztecWallet

> **aztecWallet**: `null` \| `AztecDappWallet`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:131](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L131)

Aztec wallet instance with typed methods

***

### chain

> **chain**: `null` \| \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:109](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L109)

Current chain information

***

### chainId

> **chainId**: `null` \| `string`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:111](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L111)

Current chain ID

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:137](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L137)

Combined error from account or provider

***

### isAvailable

> **isAvailable**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:141](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L141)

Whether wallet is available

***

### isAztecChain

> **isAztecChain**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:149](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L149)

Whether on an Aztec chain

***

### isConnected

> **isConnected**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:101](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L101)

Whether wallet is connected

***

### isLoading

> **isLoading**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:135](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L135)

Whether currently initializing Aztec wallet

***

### isLoadingAccounts

> **isLoadingAccounts**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:127](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L127)

Whether accounts are currently loading

***

### isReady

> **isReady**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:133](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L133)

Whether Aztec wallet is ready for use

***

### refreshAccounts()

> **refreshAccounts**: () => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:125](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L125)

Refresh the account list

#### Returns

`Promise`\<`void`\>

***

### signMessage()

> **signMessage**: (`message`) => `Promise`\<`string`\>

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:123](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L123)

Sign a message with the current account

#### Parameters

##### message

`string`

#### Returns

`Promise`\<`string`\>

***

### status

> **status**: `"connecting"` \| `"connected"` \| `"error"` \| `"disconnected"` \| `"ready"`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:147](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L147)

Overall status combining connection and wallet readiness

***

### switchAccount()

> **switchAccount**: (`address`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:121](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L121)

Switch to a different account

#### Parameters

##### address

`unknown`

#### Returns

`Promise`\<`void`\>

***

### wallet

> **wallet**: `null` \| [`WalletInfo`](WalletInfo.md)

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:113](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L113)

Wallet information

***

### walletId

> **walletId**: `null` \| `string`

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:143](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecWallet.ts#L143)

Wallet ID providing this provider
