[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshContextValue

# Interface: WalletMeshContextValue

Defined in: [core/modal-react/src/types.ts:425](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L425)

WalletMesh React context value
Provides access to headless instance and React-optimized state

## Properties

### close()

> **close**: () => `void`

Defined in: [core/modal-react/src/types.ts:454](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L454)

Close the modal

#### Returns

`void`

***

### connect()

> **connect**: (`walletId?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/types.ts:442](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L442)

Connect to a wallet with React-friendly error handling

#### Parameters

##### walletId?

`string`

#### Returns

`Promise`\<`void`\>

***

### disconnect()

> **disconnect**: (`walletId?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/types.ts:444](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L444)

Disconnect from a specific wallet

#### Parameters

##### walletId?

`string`

#### Returns

`Promise`\<`void`\>

***

### hasMounted?

> `optional` **hasMounted**: `boolean`

Defined in: [core/modal-react/src/types.ts:460](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L460)

Whether component has mounted on client

***

### initializationError

> **initializationError**: `null` \| `Error`

Defined in: [core/modal-react/src/types.ts:438](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L438)

Error that occurred during initialization

***

### isConnected

> **isConnected**: `boolean`

Defined in: [core/modal-react/src/types.ts:446](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L446)

Whether any wallet is connected

***

### isInitializing

> **isInitializing**: `boolean`

Defined in: [core/modal-react/src/types.ts:436](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L436)

Whether the WalletMesh client is currently being initialized

***

### isOpen

> **isOpen**: `boolean`

Defined in: [core/modal-react/src/types.ts:450](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L450)

Whether modal is open

***

### isSSR?

> `optional` **isSSR**: `boolean`

Defined in: [core/modal-react/src/types.ts:458](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L458)

Whether currently in SSR mode

***

### mesh

> **mesh**: `null` \| [`HeadlessWalletMesh`](HeadlessWalletMesh.md)

Defined in: [core/modal-react/src/types.ts:428](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L428)

The headless WalletMesh instance (null during initialization)

***

### open()

> **open**: () => `void`

Defined in: [core/modal-react/src/types.ts:452](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L452)

Open the modal

#### Returns

`void`

***

### state

> **state**: `null` \| [`ReactWalletMeshState`](ReactWalletMeshState.md)

Defined in: [core/modal-react/src/types.ts:432](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L432)

Current WalletMesh state (null during initialization)
