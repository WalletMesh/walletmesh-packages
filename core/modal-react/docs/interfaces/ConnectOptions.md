[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ConnectOptions

# Interface: ConnectOptions

Defined in: [core/modal-react/src/hooks/useConnect.ts:64](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L64)

Connection options for the connect method

## Properties

### chain?

> `optional` **chain**: [`ChainConfig`](ChainConfig.md)

Defined in: [core/modal-react/src/hooks/useConnect.ts:66](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L66)

Chain to connect to - overrides the wallet's default chain

***

### isReconnection?

> `optional` **isReconnection**: `boolean`

Defined in: [core/modal-react/src/hooks/useConnect.ts:72](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L72)

Whether this is an auto-reconnection attempt (for internal use)

***

### onProgress()?

> `optional` **onProgress**: (`progress`) => `void`

Defined in: [core/modal-react/src/hooks/useConnect.ts:70](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L70)

Connection progress callback - receives progress percentage (0-100)

#### Parameters

##### progress

`number`

#### Returns

`void`

***

### sessionId?

> `optional` **sessionId**: `string`

Defined in: [core/modal-react/src/hooks/useConnect.ts:74](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L74)

Session ID for reconnection attempts

***

### showModal?

> `optional` **showModal**: `boolean`

Defined in: [core/modal-react/src/hooks/useConnect.ts:68](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L68)

Whether to show modal if wallet not specified (default: true)
