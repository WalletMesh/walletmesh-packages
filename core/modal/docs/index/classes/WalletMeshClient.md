[**@walletmesh/modal v0.0.5**](../../README.md)

***

[@walletmesh/modal](../../modules.md) / [index](../README.md) / WalletMeshClient

# Class: WalletMeshClient

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:32](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/client/WalletMeshClient.ts#L32)

Main client class for managing wallet connections and sessions

Handles wallet connection lifecycle, session management, and state persistence.
Implements a singleton pattern to ensure only one instance exists per application.

## Example

```typescript
const client = WalletMeshClient.getInstance({
  name: 'My dApp',
  icon: 'https://mydapp.com/icon.png'
});

await client.initialize();
const wallet = await client.connectWallet(walletInfo);
```

## Implements

- [`WalletClient`](../../lib/client/types/interfaces/WalletClient.md)

## Methods

### getInstance()

> `static` **getInstance**(`dappInfo`): [`WalletMeshClient`](WalletMeshClient.md)

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:57](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/client/WalletMeshClient.ts#L57)

Gets or creates a WalletMeshClient instance. Implements singleton pattern.

#### Parameters

##### dappInfo

[`DappInfo`](../interfaces/DappInfo.md)

Information about the dApp to be shared with wallets

#### Returns

[`WalletMeshClient`](WalletMeshClient.md)

The singleton WalletMeshClient instance

#### Throws

If initialization fails

#### Example

```typescript
const client = WalletMeshClient.getInstance({
  name: 'My dApp',
  icon: 'https://mydapp.com/icon.png'
});
```

***

### resetInstance()

> `static` **resetInstance**(): `void`

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:86](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/client/WalletMeshClient.ts#L86)

Resets the singleton instance for testing or hard resets.
Cleans up existing connections and clears internal state.

#### Returns

`void`

#### Remarks

This method should only be used for testing or when a complete reset is required.
Normal application flow should use [prepareForTransition](WalletMeshClient.md#preparefortransition) instead.

***

### initialize()

> **initialize**(): `Promise`\<`null` \| [`ConnectedWallet`](../interfaces/ConnectedWallet.md)\>

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:209](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/client/WalletMeshClient.ts#L209)

Initialize the client and attempt to restore any saved session.

#### Returns

`Promise`\<`null` \| [`ConnectedWallet`](../interfaces/ConnectedWallet.md)\>

Promise resolving to the restored wallet if successful, null otherwise

#### Throws

If initialization fails

#### Remarks

This method should be called before any other client operations.
If already initialized, it will return the current state.
If initialization is in progress, it will wait for completion.

#### Example

```typescript
const client = WalletMeshClient.getInstance(dappInfo);
const restoredWallet = await client.initialize();
if (restoredWallet) {
  console.log('Session restored:', restoredWallet.info.id);
}
```

#### Implementation of

[`WalletClient`](../../lib/client/types/interfaces/WalletClient.md).[`initialize`](../../lib/client/types/interfaces/WalletClient.md#initialize)

***

### getDappInfo()

> **getDappInfo**(): `Readonly`\<[`DappInfo`](../interfaces/DappInfo.md)\>

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:283](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/client/WalletMeshClient.ts#L283)

Get the DApp information provided during instantiation.

#### Returns

`Readonly`\<[`DappInfo`](../interfaces/DappInfo.md)\>

Readonly DApp information object

#### Remarks

The returned object is frozen to prevent modifications.

#### Implementation of

[`WalletClient`](../../lib/client/types/interfaces/WalletClient.md).[`getDappInfo`](../../lib/client/types/interfaces/WalletClient.md#getdappinfo)

***

### connectWallet()

> **connectWallet**(`walletInfo`, `transport`, `adapter`, `options`): `Promise`\<[`ConnectedWallet`](../interfaces/ConnectedWallet.md)\>

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:313](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/client/WalletMeshClient.ts#L313)

Connect to a wallet using the provided configuration.

#### Parameters

##### walletInfo

[`WalletInfo`](../interfaces/WalletInfo.md)

Information about the wallet to connect to

##### transport

[`Transport`](../../lib/transports/types/interfaces/Transport.md)

Transport instance for wallet communication

##### adapter

[`Adapter`](../../lib/adapters/types/interfaces/Adapter.md)

Adapter instance for wallet protocol handling

##### options

Connection options

###### persist

`boolean`

Whether to persist the session (default: false)

#### Returns

`Promise`\<[`ConnectedWallet`](../interfaces/ConnectedWallet.md)\>

Promise resolving to the connected wallet

#### Throws

If client is not initialized

#### Throws

If wallet ID is missing

#### Throws

If wallet is already connected

#### Throws

If connection fails

#### Example

```typescript
const transport = createTransport(config);
const adapter = createAdapter(config);
const wallet = await client.connectWallet(
  walletInfo,
  transport,
  adapter,
  { persist: true }
);
```

#### Implementation of

[`WalletClient`](../../lib/client/types/interfaces/WalletClient.md).[`connectWallet`](../../lib/client/types/interfaces/WalletClient.md#connectwallet)

***

### disconnectWallet()

> **disconnectWallet**(`walletId`, `options`): `Promise`\<`void`\>

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:425](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/client/WalletMeshClient.ts#L425)

Disconnects a specific wallet and optionally removes its session.

#### Parameters

##### walletId

`string`

ID of the wallet to disconnect

##### options

Disconnection options

###### removeSession

`boolean`

Whether to remove the session from storage (default: true)

#### Returns

`Promise`\<`void`\>

#### Remarks

If removeSession is false, the session will be kept for potential restoration.
The method includes a 5-second timeout for cleanup operations.

#### Example

```typescript
// Disconnect and remove session
await client.disconnectWallet(walletId);

// Disconnect but keep session for later
await client.disconnectWallet(walletId, { removeSession: false });
```

#### Implementation of

[`WalletClient`](../../lib/client/types/interfaces/WalletClient.md).[`disconnectWallet`](../../lib/client/types/interfaces/WalletClient.md#disconnectwallet)

***

### getProvider()

> **getProvider**(`walletId`): `Promise`\<`unknown`\>

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:481](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/client/WalletMeshClient.ts#L481)

Gets provider for a specific wallet.

#### Parameters

##### walletId

`string`

ID of the wallet to get provider for

#### Returns

`Promise`\<`unknown`\>

Promise resolving to the wallet provider

#### Throws

If no session is found for the wallet

#### Throws

If no adapter is available for the wallet

#### Implementation of

[`WalletClient`](../../lib/client/types/interfaces/WalletClient.md).[`getProvider`](../../lib/client/types/interfaces/WalletClient.md#getprovider)

***

### getConnectedWallets()

> **getConnectedWallets**(): [`ConnectedWallet`](../interfaces/ConnectedWallet.md)[]

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:527](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/client/WalletMeshClient.ts#L527)

Lists all currently connected wallets.

#### Returns

[`ConnectedWallet`](../interfaces/ConnectedWallet.md)[]

Array of connected wallet objects

#### Example

```typescript
const wallets = client.getConnectedWallets();
console.log('Connected wallets:', wallets.map(w => w.info.id));
```

#### Implementation of

[`WalletClient`](../../lib/client/types/interfaces/WalletClient.md).[`getConnectedWallets`](../../lib/client/types/interfaces/WalletClient.md#getconnectedwallets)

***

### getConnectedWallet()

> **getConnectedWallet**(): `null` \| [`ConnectedWallet`](../interfaces/ConnectedWallet.md)

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:547](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/client/WalletMeshClient.ts#L547)

Gets the currently connected wallet, if any.

#### Returns

`null` \| [`ConnectedWallet`](../interfaces/ConnectedWallet.md)

The currently connected wallet or null if none connected

#### Example

```typescript
const wallet = client.getConnectedWallet();
if (wallet) {
  console.log('Connected to:', wallet.info.id);
}
```

#### Implementation of

[`WalletClient`](../../lib/client/types/interfaces/WalletClient.md).[`getConnectedWallet`](../../lib/client/types/interfaces/WalletClient.md#getconnectedwallet)

***

### handleError()

> **handleError**(`error`): `void`

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:561](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/client/WalletMeshClient.ts#L561)

**`Internal`**

Handles wallet errors by logging them.

#### Parameters

##### error

[`WalletError`](../../lib/client/types/classes/WalletError.md)

The wallet error to handle

This is an internal method used for error handling.

#### Returns

`void`

#### Implementation of

[`WalletClient`](../../lib/client/types/interfaces/WalletClient.md).[`handleError`](../../lib/client/types/interfaces/WalletClient.md#handleerror)

***

### prepareForTransition()

> **prepareForTransition**(): `void`

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:583](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/client/WalletMeshClient.ts#L583)

Prepares the client for page transitions by preserving wallet states.

#### Returns

`void`

#### Remarks

This method should be called before page transitions to ensure wallet
sessions can be properly restored after navigation.

- Marks connected sessions as resumable
- Preserves session data for restoration
- Resets internal state without clearing sessions

#### Example

```typescript
// Before page navigation
client.prepareForTransition();
// Navigate to new page...
```

***

### ~~deinitialize()~~

> **deinitialize**(): `void`

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:608](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/client/WalletMeshClient.ts#L608)

Deinitialize the client.

#### Returns

`void`

#### Deprecated

Use [prepareForTransition](WalletMeshClient.md#preparefortransition) instead for page transitions

#### Remarks

This method is kept for backwards compatibility but will be removed in a future version.
