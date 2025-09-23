[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseConnectReturn

# Interface: UseConnectReturn

Defined in: [core/modal-react/src/hooks/useConnect.ts:139](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L139)

Consolidated hook return type for connection management

## Properties

### canDisconnect

> **canDisconnect**: `boolean`

Defined in: [core/modal-react/src/hooks/useConnect.ts:178](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L178)

Whether there are wallets that can be disconnected

***

### connect()

> **connect**: (`walletId?`, `options?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useConnect.ts:142](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L142)

Connect to a wallet

#### Parameters

##### walletId?

`string`

##### options?

[`ConnectOptions`](ConnectOptions.md)

#### Returns

`Promise`\<`void`\>

***

### connectedWallets

> **connectedWallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/hooks/useConnect.ts:154](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L154)

Currently connected wallets

***

### disconnect()

> **disconnect**: (`walletId?`, `options?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useConnect.ts:144](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L144)

Disconnect wallet(s)

#### Parameters

##### walletId?

`string`

##### options?

[`DisconnectOptions`](DisconnectOptions.md)

#### Returns

`Promise`\<`void`\>

***

### disconnectAll()

> **disconnectAll**: (`options?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useConnect.ts:146](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L146)

Disconnect all wallets

#### Parameters

##### options?

[`DisconnectOptions`](DisconnectOptions.md)

#### Returns

`Promise`\<`void`\>

***

### error

> **error**: `unknown`

Defined in: [core/modal-react/src/hooks/useConnect.ts:164](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L164)

Connection/disconnection error if any

***

### isConnecting

> **isConnecting**: `boolean`

Defined in: [core/modal-react/src/hooks/useConnect.ts:158](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L158)

Whether currently connecting

***

### isDisconnecting

> **isDisconnecting**: `boolean`

Defined in: [core/modal-react/src/hooks/useConnect.ts:160](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L160)

Whether currently disconnecting

***

### isPending

> **isPending**: `boolean`

Defined in: [core/modal-react/src/hooks/useConnect.ts:162](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L162)

Whether connection is pending user interaction

***

### progress

> **progress**: `number`

Defined in: [core/modal-react/src/hooks/useConnect.ts:172](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L172)

Connection progress (0-100)

***

### progressInfo

> **progressInfo**: `null` \| [`ConnectionProgress`](ConnectionProgress.md)

Defined in: [core/modal-react/src/hooks/useConnect.ts:174](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L174)

Detailed progress information

***

### reset()

> **reset**: () => `void`

Defined in: [core/modal-react/src/hooks/useConnect.ts:166](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L166)

Reset error state

#### Returns

`void`

***

### retry()

> **retry**: () => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useConnect.ts:148](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L148)

Retry a failed connection

#### Returns

`Promise`\<`void`\>

***

### status

> **status**: [`ConnectionStatus`](../enumerations/ConnectionStatus.md)

Defined in: [core/modal-react/src/hooks/useConnect.ts:156](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L156)

Current connection status

***

### variables

> **variables**: `undefined` \| [`ConnectVariables`](ConnectVariables.md)

Defined in: [core/modal-react/src/hooks/useConnect.ts:170](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L170)

Variables from current/last connection attempt

***

### wallets

> **wallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/hooks/useConnect.ts:152](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L152)

Available wallet adapters
