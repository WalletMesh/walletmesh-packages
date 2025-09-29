[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AccountInfo

# Interface: AccountInfo

Defined in: [core/modal-react/src/hooks/useAccount.ts:42](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L42)

Account information with full wallet details and selection capabilities

## Properties

### address

> **address**: `null` \| `string`

Defined in: [core/modal-react/src/hooks/useAccount.ts:45](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L45)

Primary account address

***

### addresses

> **addresses**: `string`[]

Defined in: [core/modal-react/src/hooks/useAccount.ts:47](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L47)

All connected addresses

***

### availableWallets

> **availableWallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/hooks/useAccount.ts:77](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L77)

All available wallets

***

### chain

> **chain**: `null` \| \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}

Defined in: [core/modal-react/src/hooks/useAccount.ts:61](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L61)

Current chain

***

### chainType

> **chainType**: `null` \| [`ChainType`](../enumerations/ChainType.md)

Defined in: [core/modal-react/src/hooks/useAccount.ts:63](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L63)

Current chain type

***

### clearSelection()

> **clearSelection**: () => `void`

Defined in: [core/modal-react/src/hooks/useAccount.ts:97](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L97)

Clear wallet selection and preference

#### Returns

`void`

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useAccount.ts:73](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L73)

Connection error if any

***

### getInstallUrl()

> **getInstallUrl**: (`walletId`) => `null` \| `string`

Defined in: [core/modal-react/src/hooks/useAccount.ts:95](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L95)

Get install URL for a wallet

#### Parameters

##### walletId

`string`

#### Returns

`null` \| `string`

***

### getRecommendedWallet()

> **getRecommendedWallet**: () => `null` \| [`WalletInfo`](WalletInfo.md)

Defined in: [core/modal-react/src/hooks/useAccount.ts:91](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L91)

Get recommended wallet based on current state

#### Returns

`null` \| [`WalletInfo`](WalletInfo.md)

***

### getWalletsByChain()

> **getWalletsByChain**: (`chainType`) => [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/hooks/useAccount.ts:89](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L89)

Get wallets by chain type

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

#### Returns

[`WalletInfo`](WalletInfo.md)[]

***

### isConnected

> **isConnected**: `boolean`

Defined in: [core/modal-react/src/hooks/useAccount.ts:49](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L49)

Whether an account is connected

***

### isConnecting

> **isConnecting**: `boolean`

Defined in: [core/modal-react/src/hooks/useAccount.ts:51](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L51)

Whether currently connecting

***

### isDisconnected

> **isDisconnected**: `boolean`

Defined in: [core/modal-react/src/hooks/useAccount.ts:55](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L55)

Whether disconnected

***

### isReconnecting

> **isReconnecting**: `boolean`

Defined in: [core/modal-react/src/hooks/useAccount.ts:53](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L53)

Whether currently reconnecting to an existing session

***

### isSelecting

> **isSelecting**: `boolean`

Defined in: [core/modal-react/src/hooks/useAccount.ts:81](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L81)

Whether wallet selection is in progress

***

### isWalletAvailable()

> **isWalletAvailable**: (`walletId`) => `boolean`

Defined in: [core/modal-react/src/hooks/useAccount.ts:93](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L93)

Check if a specific wallet is available

#### Parameters

##### walletId

`string`

#### Returns

`boolean`

***

### preferredWallet

> **preferredWallet**: `null` \| [`WalletInfo`](WalletInfo.md)

Defined in: [core/modal-react/src/hooks/useAccount.ts:79](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L79)

User's preferred wallet (from localStorage)

***

### provider

> **provider**: `unknown`

Defined in: [core/modal-react/src/hooks/useAccount.ts:71](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L71)

Chain-specific provider instance

***

### refreshAvailability()

> **refreshAvailability**: () => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useAccount.ts:99](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L99)

Refresh wallet availability

#### Returns

`Promise`\<`void`\>

***

### selectWallet()

> **selectWallet**: (`wallet`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useAccount.ts:85](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L85)

Select a wallet for connection

#### Parameters

##### wallet

[`WalletInfo`](WalletInfo.md)

#### Returns

`Promise`\<`void`\>

***

### setPreferredWallet()

> **setPreferredWallet**: (`wallet`) => `void`

Defined in: [core/modal-react/src/hooks/useAccount.ts:87](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L87)

Set preferred wallet (persisted)

#### Parameters

##### wallet

`null` | [`WalletInfo`](WalletInfo.md)

#### Returns

`void`

***

### status

> **status**: [`ConnectionStatus`](../enumerations/ConnectionStatus.md)

Defined in: [core/modal-react/src/hooks/useAccount.ts:57](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L57)

Connection status as string

***

### wallet

> **wallet**: `null` \| [`WalletInfo`](WalletInfo.md)

Defined in: [core/modal-react/src/hooks/useAccount.ts:67](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L67)

Connected wallet information

***

### walletId

> **walletId**: `null` \| `string`

Defined in: [core/modal-react/src/hooks/useAccount.ts:69](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L69)

Active wallet ID
