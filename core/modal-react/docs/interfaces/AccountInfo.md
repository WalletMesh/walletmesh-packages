[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AccountInfo

# Interface: AccountInfo

Defined in: [core/modal-react/src/hooks/useAccount.ts:45](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L45)

Account information with full wallet details and selection capabilities

## Properties

### address

> **address**: `null` \| `string`

Defined in: [core/modal-react/src/hooks/useAccount.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L48)

Primary account address

***

### addresses

> **addresses**: `string`[]

Defined in: [core/modal-react/src/hooks/useAccount.ts:50](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L50)

All connected addresses

***

### availableWallets

> **availableWallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/hooks/useAccount.ts:80](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L80)

All available wallets

***

### chain

> **chain**: `null` \| \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}

Defined in: [core/modal-react/src/hooks/useAccount.ts:64](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L64)

Current chain

***

### chainType

> **chainType**: `null` \| [`ChainType`](../enumerations/ChainType.md)

Defined in: [core/modal-react/src/hooks/useAccount.ts:66](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L66)

Current chain type

***

### clearSelection()

> **clearSelection**: () => `void`

Defined in: [core/modal-react/src/hooks/useAccount.ts:100](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L100)

Clear wallet selection and preference

#### Returns

`void`

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useAccount.ts:76](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L76)

Connection error if any

***

### getInstallUrl()

> **getInstallUrl**: (`walletId`) => `null` \| `string`

Defined in: [core/modal-react/src/hooks/useAccount.ts:98](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L98)

Get install URL for a wallet

#### Parameters

##### walletId

`string`

#### Returns

`null` \| `string`

***

### getRecommendedWallet()

> **getRecommendedWallet**: () => `null` \| [`WalletInfo`](WalletInfo.md)

Defined in: [core/modal-react/src/hooks/useAccount.ts:94](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L94)

Get recommended wallet based on current state

#### Returns

`null` \| [`WalletInfo`](WalletInfo.md)

***

### getWalletsByChain()

> **getWalletsByChain**: (`chainType`) => [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/hooks/useAccount.ts:92](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L92)

Get wallets by chain type

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

#### Returns

[`WalletInfo`](WalletInfo.md)[]

***

### isConnected

> **isConnected**: `boolean`

Defined in: [core/modal-react/src/hooks/useAccount.ts:52](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L52)

Whether an account is connected

***

### isConnecting

> **isConnecting**: `boolean`

Defined in: [core/modal-react/src/hooks/useAccount.ts:54](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L54)

Whether currently connecting

***

### isDisconnected

> **isDisconnected**: `boolean`

Defined in: [core/modal-react/src/hooks/useAccount.ts:58](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L58)

Whether disconnected

***

### isReconnecting

> **isReconnecting**: `boolean`

Defined in: [core/modal-react/src/hooks/useAccount.ts:56](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L56)

Whether currently reconnecting to an existing session

***

### isSelecting

> **isSelecting**: `boolean`

Defined in: [core/modal-react/src/hooks/useAccount.ts:84](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L84)

Whether wallet selection is in progress

***

### isWalletAvailable()

> **isWalletAvailable**: (`walletId`) => `boolean`

Defined in: [core/modal-react/src/hooks/useAccount.ts:96](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L96)

Check if a specific wallet is available

#### Parameters

##### walletId

`string`

#### Returns

`boolean`

***

### preferredWallet

> **preferredWallet**: `null` \| [`WalletInfo`](WalletInfo.md)

Defined in: [core/modal-react/src/hooks/useAccount.ts:82](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L82)

User's preferred wallet (from localStorage)

***

### provider

> **provider**: `unknown`

Defined in: [core/modal-react/src/hooks/useAccount.ts:74](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L74)

Chain-specific provider instance

***

### refreshAvailability()

> **refreshAvailability**: () => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useAccount.ts:102](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L102)

Refresh wallet availability

#### Returns

`Promise`\<`void`\>

***

### selectWallet()

> **selectWallet**: (`wallet`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useAccount.ts:88](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L88)

Select a wallet for connection

#### Parameters

##### wallet

[`WalletInfo`](WalletInfo.md)

#### Returns

`Promise`\<`void`\>

***

### setPreferredWallet()

> **setPreferredWallet**: (`wallet`) => `void`

Defined in: [core/modal-react/src/hooks/useAccount.ts:90](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L90)

Set preferred wallet (persisted)

#### Parameters

##### wallet

`null` | [`WalletInfo`](WalletInfo.md)

#### Returns

`void`

***

### status

> **status**: [`ConnectionStatus`](../enumerations/ConnectionStatus.md)

Defined in: [core/modal-react/src/hooks/useAccount.ts:60](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L60)

Connection status as string

***

### wallet

> **wallet**: `null` \| [`WalletInfo`](WalletInfo.md)

Defined in: [core/modal-react/src/hooks/useAccount.ts:70](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L70)

Connected wallet information

***

### walletId

> **walletId**: `null` \| `string`

Defined in: [core/modal-react/src/hooks/useAccount.ts:72](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L72)

Active wallet ID
