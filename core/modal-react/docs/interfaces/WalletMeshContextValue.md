[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshContextValue

# Interface: WalletMeshContextValue

Defined in: [core/modal-react/src/types.ts:558](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L558)

WalletMesh React context value
Provides access to headless instance and React-optimized state

## Properties

### close()

> **close**: () => `void`

Defined in: [core/modal-react/src/types.ts:587](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L587)

Close the modal

#### Returns

`void`

***

### connect()

> **connect**: (`walletId?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/types.ts:575](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L575)

Connect to a wallet with React-friendly error handling

#### Parameters

##### walletId?

`string`

#### Returns

`Promise`\<`void`\>

***

### disconnect()

> **disconnect**: (`walletId?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/types.ts:577](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L577)

Disconnect from a specific wallet

#### Parameters

##### walletId?

`string`

#### Returns

`Promise`\<`void`\>

***

### hasMounted?

> `optional` **hasMounted**: `boolean`

Defined in: [core/modal-react/src/types.ts:593](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L593)

Whether component has mounted on client

***

### initializationError

> **initializationError**: `null` \| `Error`

Defined in: [core/modal-react/src/types.ts:571](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L571)

Error that occurred during initialization

***

### isConnected

> **isConnected**: `boolean`

Defined in: [core/modal-react/src/types.ts:579](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L579)

Whether any wallet is connected

***

### isInitializing

> **isInitializing**: `boolean`

Defined in: [core/modal-react/src/types.ts:569](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L569)

Whether the WalletMesh client is currently being initialized

***

### isOpen

> **isOpen**: `boolean`

Defined in: [core/modal-react/src/types.ts:583](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L583)

Whether modal is open

***

### isSSR?

> `optional` **isSSR**: `boolean`

Defined in: [core/modal-react/src/types.ts:591](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L591)

Whether currently in SSR mode

***

### mesh

> **mesh**: `null` \| [`HeadlessWalletMesh`](HeadlessWalletMesh.md)

Defined in: [core/modal-react/src/types.ts:561](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L561)

The headless WalletMesh instance (null during initialization)

***

### open()

> **open**: () => `void`

Defined in: [core/modal-react/src/types.ts:585](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L585)

Open the modal

#### Returns

`void`

***

### state

> **state**: `null` \| [`ReactWalletMeshState`](ReactWalletMeshState.md)

Defined in: [core/modal-react/src/types.ts:565](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L565)

Current WalletMesh state (null during initialization)
