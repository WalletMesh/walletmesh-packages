[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / InternalWalletMeshClient

# Interface: InternalWalletMeshClient

Comprehensive WalletMesh client interface for managing wallet connections.

This interface provides comprehensive wallet management capabilities including
connection handling, chain management, wallet discovery, and event subscriptions.

## Example

```typescript
const client = createWalletMesh(config);

// Connect to a wallet
const connection = await client.connect('metamask');

// Switch chains
await client.switchChain('137', 'metamask');

// Listen for state changes
client.subscribe((state) => {
  console.log('State changed:', state);
});
```

## Since

1.0.0

## Properties

### isConnected

> `readonly` **isConnected**: `boolean`

Whether any wallet is currently connected.

***

### modal

> **modal**: [`ModalController`](ModalController.md)

Modal controller for UI interactions.

***

### registry

> **registry**: [`WalletRegistry`](../classes/WalletRegistry.md)

Wallet registry for managing wallet adapters.

## Methods

### closeModal()

> **closeModal**(): `void`

Close the wallet selection modal.

#### Returns

`void`

***

### connect()

> **connect**(`walletId?`, `options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletConnection`](WalletConnection.md)\>

Connect to a wallet.

#### Parameters

##### walletId?

`string`

Optional ID of specific wallet to connect. If not provided, shows modal.

##### options?

`unknown`

Optional connection options specific to the wallet.

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletConnection`](WalletConnection.md)\>

Promise resolving to the wallet connection.

#### Throws

If connection fails or is rejected by user.

#### Example

```typescript
// Show modal for user to select wallet
const connection = await client.connect();

// Connect to specific wallet
const connection = await client.connect('metamask');
```

***

### destroy()

> **destroy**(): `void`

Destroy the client and clean up all resources.
Call this when unmounting or disposing of the client.

#### Returns

`void`

***

### disconnect()

> **disconnect**(`walletId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Disconnect from a specific wallet.

#### Parameters

##### walletId

`string`

ID of the wallet to disconnect.

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when disconnected.

#### Throws

If wallet is not connected or disconnect fails.

***

### disconnectAll()

> **disconnectAll**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Disconnect from all connected wallets.

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when all wallets are disconnected.

***

### discoverWallets()

> **discoverWallets**(`options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AvailableWallet`](AvailableWallet.md)[]\>

Detect all available wallets in the user's environment.

#### Parameters

##### options?

`any`

Optional discovery request options to filter wallets

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AvailableWallet`](AvailableWallet.md)[]\>

Promise resolving to array of detected wallets with availability status.

#### Example

```typescript
const wallets = await client.discoverWallets();
const installed = wallets.filter(w => w.available);
```

***

### getActiveWallet()

> **getActiveWallet**(): `null` \| `string`

Get the currently active wallet ID.

#### Returns

`null` \| `string`

The active wallet ID or null if none active.

***

### getAllConnections()

> **getAllConnections**(): [`WalletConnection`](WalletConnection.md)[]

Get all wallet connections with full connection details.

#### Returns

[`WalletConnection`](WalletConnection.md)[]

Array of wallet connection objects.

***

### getAllWallets()

> **getAllWallets**(): [`WalletAdapter`](WalletAdapter.md)[]

Get all registered wallet adapters.

#### Returns

[`WalletAdapter`](WalletAdapter.md)[]

Array of all registered wallet adapters.

***

### getConnection()

> **getConnection**(`walletId`): `undefined` \| [`WalletAdapter`](WalletAdapter.md)

Get a specific wallet connection by ID.

#### Parameters

##### walletId

`string`

ID of the wallet.

#### Returns

`undefined` \| [`WalletAdapter`](WalletAdapter.md)

The wallet adapter if connected, undefined otherwise.

***

### getConnections()

> **getConnections**(): [`WalletAdapter`](WalletAdapter.md)[]

Get all connected wallet adapters.

#### Returns

[`WalletAdapter`](WalletAdapter.md)[]

Array of connected wallet adapters.

***

### getMaxConnections()

> **getMaxConnections**(): `number`

Get the maximum number of concurrent connections allowed.

#### Returns

`number`

Maximum connection limit.

***

### getWallet()

> **getWallet**(`walletId`): `undefined` \| [`WalletAdapter`](WalletAdapter.md)

Get a specific wallet adapter by ID.

#### Parameters

##### walletId

`string`

ID of the wallet.

#### Returns

`undefined` \| [`WalletAdapter`](WalletAdapter.md)

The wallet adapter if registered, undefined otherwise.

***

### openModal()

> **openModal**(`options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Open the wallet selection modal.

#### Parameters

##### options?

Optional parameters including targetChainType for filtering wallets

###### targetChainType?

[`ChainType`](../enumerations/ChainType.md)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when modal is opened.

***

### setActiveWallet()

> **setActiveWallet**(`walletId`): `void`

Set the active wallet for operations.

#### Parameters

##### walletId

`string`

ID of the wallet to make active.

#### Returns

`void`

#### Throws

If wallet is not connected.

***

### switchChain()

> **switchChain**(`chainId`, `walletId?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `previousChainId`: `string`; `provider`: `unknown`; \}\>

Switch to a different blockchain network.

#### Parameters

##### chainId

`string`

ID of the chain to switch to.

##### walletId?

`string`

Optional wallet ID. Uses active wallet if not specified.

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `previousChainId`: `string`; `provider`: `unknown`; \}\>

Promise resolving to chain switch details.

#### Throws

If chain is not supported or switch fails.

#### Example

```typescript
const result = await client.switchChain('137'); // Switch to Polygon
console.log(`Switched from ${result.previousChainId} to ${result.chainId}`);
```
