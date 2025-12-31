[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ConnectOptions

# Interface: ConnectOptions

Defined in: [core/modal-react/src/hooks/useConnect.ts:70](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useConnect.ts#L70)

Connection options for the connect method

## Properties

### chain?

> `optional` **chain**: [`ChainConfig`](ChainConfig.md)

Defined in: [core/modal-react/src/hooks/useConnect.ts:72](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useConnect.ts#L72)

Chain to connect to - overrides the wallet's default chain

***

### isReconnection?

> `optional` **isReconnection**: `boolean`

Defined in: [core/modal-react/src/hooks/useConnect.ts:78](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useConnect.ts#L78)

Whether this is an auto-reconnection attempt (for internal use)

***

### onProgress()?

> `optional` **onProgress**: (`progress`) => `void`

Defined in: [core/modal-react/src/hooks/useConnect.ts:76](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useConnect.ts#L76)

Connection progress callback - receives progress percentage (0-100)

#### Parameters

##### progress

`number`

#### Returns

`void`

***

### sessionId?

> `optional` **sessionId**: `string`

Defined in: [core/modal-react/src/hooks/useConnect.ts:80](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useConnect.ts#L80)

Session ID for reconnection attempts

***

### showModal?

> `optional` **showModal**: `boolean`

Defined in: [core/modal-react/src/hooks/useConnect.ts:74](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useConnect.ts#L74)

Whether to show modal if wallet not specified (default: true)
