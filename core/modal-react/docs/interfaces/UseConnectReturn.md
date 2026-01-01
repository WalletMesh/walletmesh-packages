[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseConnectReturn

# Interface: UseConnectReturn

Defined in: [core/modal-react/src/hooks/useConnect.ts:141](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L141)

Consolidated hook return type for connection management

## Properties

### canDisconnect

> **canDisconnect**: `boolean`

Defined in: [core/modal-react/src/hooks/useConnect.ts:180](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L180)

Whether there are wallets that can be disconnected

***

### connect()

> **connect**: (`walletId?`, `options?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useConnect.ts:144](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L144)

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

Defined in: [core/modal-react/src/hooks/useConnect.ts:156](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L156)

Currently connected wallets

***

### disconnect()

> **disconnect**: (`walletId?`, `options?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useConnect.ts:146](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L146)

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

Defined in: [core/modal-react/src/hooks/useConnect.ts:148](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L148)

Disconnect all wallets

#### Parameters

##### options?

[`DisconnectOptions`](DisconnectOptions.md)

#### Returns

`Promise`\<`void`\>

***

### error

> **error**: `unknown`

Defined in: [core/modal-react/src/hooks/useConnect.ts:166](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L166)

Connection/disconnection error if any

***

### isConnecting

> **isConnecting**: `boolean`

Defined in: [core/modal-react/src/hooks/useConnect.ts:160](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L160)

Whether currently connecting

***

### isDisconnecting

> **isDisconnecting**: `boolean`

Defined in: [core/modal-react/src/hooks/useConnect.ts:162](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L162)

Whether currently disconnecting

***

### isPending

> **isPending**: `boolean`

Defined in: [core/modal-react/src/hooks/useConnect.ts:164](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L164)

Whether connection is pending user interaction

***

### progress

> **progress**: `number`

Defined in: [core/modal-react/src/hooks/useConnect.ts:174](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L174)

Connection progress (0-100)

***

### progressInfo

> **progressInfo**: `null` \| `ConnectionProgressInfo`

Defined in: [core/modal-react/src/hooks/useConnect.ts:176](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L176)

Detailed progress information

***

### reset()

> **reset**: () => `void`

Defined in: [core/modal-react/src/hooks/useConnect.ts:168](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L168)

Reset error state

#### Returns

`void`

***

### retry()

> **retry**: () => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useConnect.ts:150](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L150)

Retry a failed connection

#### Returns

`Promise`\<`void`\>

***

### status

> **status**: [`ConnectionStatus`](../enumerations/ConnectionStatus.md)

Defined in: [core/modal-react/src/hooks/useConnect.ts:158](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L158)

Current connection status

***

### variables

> **variables**: `undefined` \| [`ConnectVariables`](ConnectVariables.md)

Defined in: [core/modal-react/src/hooks/useConnect.ts:172](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L172)

Variables from current/last connection attempt

***

### wallets

> **wallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/hooks/useConnect.ts:154](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L154)

Available wallet adapters
