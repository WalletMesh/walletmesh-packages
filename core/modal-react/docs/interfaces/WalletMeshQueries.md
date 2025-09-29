[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshQueries

# Interface: WalletMeshQueries

Defined in: [core/modal-react/src/types.ts:100](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L100)

Headless WalletMesh queries interface
Pure state queries without UI dependencies

## Methods

### getAvailableWallets()

> **getAvailableWallets**(): [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/types.ts:101](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L101)

#### Returns

[`WalletInfo`](WalletInfo.md)[]

***

### getConnectionStatus()

> **getConnectionStatus**(): [`ConnectionStatus`](../enumerations/ConnectionStatus.md)

Defined in: [core/modal-react/src/types.ts:102](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L102)

#### Returns

[`ConnectionStatus`](../enumerations/ConnectionStatus.md)

***

### getCurrentError()

> **getCurrentError**(): `null` \| \{ `category`: `"wallet"` \| `"user"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"`; `cause?`: `unknown`; `classification?`: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`; `code`: `string`; `data?`: `Record`\<`string`, `unknown`\>; `maxRetries?`: `number`; `message`: `string`; `recoveryStrategy?`: `"none"` \| `"retry"` \| `"wait_and_retry"` \| `"manual_action"`; `retryDelay?`: `number`; \}

Defined in: [core/modal-react/src/types.ts:103](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L103)

#### Returns

`null` \| \{ `category`: `"wallet"` \| `"user"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"`; `cause?`: `unknown`; `classification?`: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`; `code`: `string`; `data?`: `Record`\<`string`, `unknown`\>; `maxRetries?`: `number`; `message`: `string`; `recoveryStrategy?`: `"none"` \| `"retry"` \| `"wait_and_retry"` \| `"manual_action"`; `retryDelay?`: `number`; \}

***

### getProvider()

> **getProvider**(): `unknown`

Defined in: [core/modal-react/src/types.ts:104](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L104)

#### Returns

`unknown`

***

### getProviderVersion()

> **getProviderVersion**(): `number`

Defined in: [core/modal-react/src/types.ts:106](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L106)

#### Returns

`number`

***

### isConnected()

> **isConnected**(): `boolean`

Defined in: [core/modal-react/src/types.ts:105](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L105)

#### Returns

`boolean`
