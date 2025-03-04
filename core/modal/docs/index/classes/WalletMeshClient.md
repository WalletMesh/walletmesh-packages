[**@walletmesh/modal v0.0.6**](../../README.md)

***

[@walletmesh/modal](../../modules.md) / [index](../README.md) / WalletMeshClient

# Class: WalletMeshClient

Defined in: [core/modal/src/lib/client/client.ts:56](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/client.ts#L56)

Core client class for managing wallet connections and sessions.

The WalletMeshClient is the central coordinator for wallet interactions, responsible for:
- Managing wallet connections and disconnections
- Handling session persistence and restoration
- Coordinating between connectors and session management
- Providing wallet state and provider access

## Remarks

This class implements the Singleton pattern to ensure consistent state management
across the application. It automatically handles page transitions and cleanup
through browser lifecycle events.

Key features:
- Automatic session restoration
- Connection state management
- Page transition handling
- Error recovery with retry logic

## Example

```typescript
// Get client instance
const client = WalletMeshClient.getInstance({
  name: 'My DApp',
  description: 'DApp Description',
  icon: 'data:image/svg+xml,...'
});

// Initialize and restore sessions
await client.initialize();

// Connect a wallet
const connector = createConnector(walletConfig);
const wallet = await client.connectWallet(walletInfo, connector);
```

## See

 - SessionManager for session persistence details
 - [Connector](../../lib/connectors/types/interfaces/Connector.md) for wallet connection handling

## Implements

- [`WalletClient`](../../lib/client/types/interfaces/WalletClient.md)

## Methods

### getInstance()

> `static` **getInstance**(`dappInfo`): [`WalletMeshClient`](WalletMeshClient.md)

Defined in: [core/modal/src/lib/client/client.ts:85](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/client.ts#L85)

Gets or creates the singleton instance of WalletMeshClient.

#### Parameters

##### dappInfo

[`DappInfo`](../interfaces/DappInfo.md)

Information about the dApp to share with wallets

#### Returns

[`WalletMeshClient`](WalletMeshClient.md)

The singleton WalletMeshClient instance

#### Remarks

This method ensures only one client instance exists and automatically
sets up cleanup handlers for page transitions.

#### Example

```typescript
const client = WalletMeshClient.getInstance({
  name: 'My DApp',
  description: 'DApp Description',
  icon: 'data:image/svg+xml,...'
});
```

***

### initialize()

> **initialize**(): `Promise`\<`null` \| [`ConnectedWallet`](../interfaces/ConnectedWallet.md)\>

Defined in: [core/modal/src/lib/client/client.ts:230](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/client.ts#L230)

Initializes the client and attempts to restore any saved sessions.

#### Returns

`Promise`\<`null` \| [`ConnectedWallet`](../interfaces/ConnectedWallet.md)\>

Promise resolving to the restored wallet if successful, null otherwise

#### Throws

If initialization fails

#### Remarks

- Prevents multiple simultaneous initializations
- Attempts to restore the most recently active session
- Handles initialization failures gracefully

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

Defined in: [core/modal/src/lib/client/client.ts:301](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/client.ts#L301)

Gets the dApp information associated with this client instance.

#### Returns

`Readonly`\<[`DappInfo`](../interfaces/DappInfo.md)\>

Immutable dApp information object

#### Remarks

The returned object is frozen to prevent modifications after initialization.

#### Implementation of

[`WalletClient`](../../lib/client/types/interfaces/WalletClient.md).[`getDappInfo`](../../lib/client/types/interfaces/WalletClient.md#getdappinfo)

***

### connectWallet()

> **connectWallet**(`walletInfo`, `connector`): `Promise`\<[`ConnectedWallet`](../interfaces/ConnectedWallet.md)\>

Defined in: [core/modal/src/lib/client/client.ts:332](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/client.ts#L332)

Establishes a connection with a wallet.

#### Parameters

##### walletInfo

[`WalletInfo`](../interfaces/WalletInfo.md)

Information about the wallet to connect

##### connector

[`Connector`](../../lib/connectors/types/interfaces/Connector.md)

The connector instance to use

#### Returns

`Promise`\<[`ConnectedWallet`](../interfaces/ConnectedWallet.md)\>

Promise resolving to the connected wallet

#### Throws

If client is not initialized or connection fails

#### Remarks

- Requires prior client initialization
- Prevents duplicate connections
- Automatically persists successful connections
- Handles cleanup on failure

#### Example

```typescript
const connector = createConnector({
  type: 'wm_aztec',
  options: { chainId: 'aztec:testnet' }
});

const wallet = await client.connectWallet({
  id: 'my-wallet',
  name: 'My Wallet'
}, connector);
```

#### Implementation of

[`WalletClient`](../../lib/client/types/interfaces/WalletClient.md).[`connectWallet`](../../lib/client/types/interfaces/WalletClient.md#connectwallet)

***

### disconnectWallet()

> **disconnectWallet**(`walletId`): `Promise`\<`void`\>

Defined in: [core/modal/src/lib/client/client.ts:395](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/client.ts#L395)

Disconnects a wallet and cleans up its resources.

#### Parameters

##### walletId

`string`

ID of the wallet to disconnect

#### Returns

`Promise`\<`void`\>

#### Remarks

- Implements timeout protection (5 seconds)
- Always removes session even if disconnect fails
- Handles cleanup of connector resources

#### Example

```typescript
await client.disconnectWallet('wallet-123');
```

#### Implementation of

[`WalletClient`](../../lib/client/types/interfaces/WalletClient.md).[`disconnectWallet`](../../lib/client/types/interfaces/WalletClient.md#disconnectwallet)

***

### getChainProvider()

> **getChainProvider**(`walletId`): `Promise`\<`unknown`\>

Defined in: [core/modal/src/lib/client/client.ts:437](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/client.ts#L437)

Gets the blockchain-specific provider for a connected wallet.

#### Parameters

##### walletId

`string`

ID of the wallet

#### Returns

`Promise`\<`unknown`\>

Promise resolving to the provider instance

#### Throws

If no session exists or no connector is available

#### Example

```typescript
const provider = await client.getProvider('wallet-123');
// Use provider for blockchain interactions
const accounts = await provider.request({ method: 'eth_accounts' });
```

#### Implementation of

[`WalletClient`](../../lib/client/types/interfaces/WalletClient.md).[`getChainProvider`](../../lib/client/types/interfaces/WalletClient.md#getchainprovider)

***

### getWalletConnections()

> **getWalletConnections**(`walletId`): `Promise`\<`undefined` \| `Map`\<`number`, [`ChainConnection`](../../lib/client/types/interfaces/ChainConnection.md)\>\>

Defined in: [core/modal/src/lib/client/client.ts:454](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/client.ts#L454)

Gets all chain connections for a specific wallet.

#### Parameters

##### walletId

`string`

ID of the wallet

#### Returns

`Promise`\<`undefined` \| `Map`\<`number`, [`ChainConnection`](../../lib/client/types/interfaces/ChainConnection.md)\>\>

Promise resolving to a map of chain connections or undefined if not found

#### Implementation of

[`WalletClient`](../../lib/client/types/interfaces/WalletClient.md).[`getWalletConnections`](../../lib/client/types/interfaces/WalletClient.md#getwalletconnections)

***

### getConnectedWallets()

> **getConnectedWallets**(): [`ConnectedWallet`](../interfaces/ConnectedWallet.md)[]

Defined in: [core/modal/src/lib/client/client.ts:495](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/client.ts#L495)

Gets all currently connected wallets.

#### Returns

[`ConnectedWallet`](../interfaces/ConnectedWallet.md)[]

Array of connected wallet instances

#### Example

```typescript
const wallets = client.getConnectedWallets();
console.log('Connected wallets:', wallets.length);
```

#### Implementation of

[`WalletClient`](../../lib/client/types/interfaces/WalletClient.md).[`getConnectedWallets`](../../lib/client/types/interfaces/WalletClient.md#getconnectedwallets)

***

### getConnectedWallet()

> **getConnectedWallet**(): `null` \| [`ConnectedWallet`](../interfaces/ConnectedWallet.md)

Defined in: [core/modal/src/lib/client/client.ts:518](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/client.ts#L518)

Gets the primary connected wallet.

#### Returns

`null` \| [`ConnectedWallet`](../interfaces/ConnectedWallet.md)

The currently connected wallet or null if none connected

#### Remarks

Returns the first connected wallet if multiple are connected.

#### Example

```typescript
const wallet = client.getConnectedWallet();
if (wallet) {
  console.log('Connected to:', wallet.info.name);
}
```

#### Implementation of

[`WalletClient`](../../lib/client/types/interfaces/WalletClient.md).[`getConnectedWallet`](../../lib/client/types/interfaces/WalletClient.md#getconnectedwallet)

***

### handleWalletError()

> **handleWalletError**(`error`): `void`

Defined in: [core/modal/src/lib/client/client.ts:533](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/client.ts#L533)

Handles wallet-related errors.

#### Parameters

##### error

`Error`

The error to handle

#### Returns

`void`

#### Remarks

Currently logs errors to console, but could be extended
to implement more sophisticated error handling.

#### Implementation of

[`WalletClient`](../../lib/client/types/interfaces/WalletClient.md).[`handleWalletError`](../../lib/client/types/interfaces/WalletClient.md#handlewalleterror)

***

### prepareForTransition()

> **prepareForTransition**(): `void`

Defined in: [core/modal/src/lib/client/client.ts:548](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/client.ts#L548)

Prepares the client for a page transition.

#### Returns

`void`

#### Remarks

- Updates connected sessions to resumable state
- Preserves sessions for restoration after navigation
- Resets internal state

This method is automatically called on 'beforeunload'
and 'pagehide' events.

***

### ~~deinitialize()~~

> **deinitialize**(): `void`

Defined in: [core/modal/src/lib/client/client.ts:568](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/client.ts#L568)

#### Returns

`void`

#### Deprecated

Use [prepareForTransition](WalletMeshClient.md#preparefortransition) instead
Legacy method for backwards compatibility

***

### resetInstance()

> `static` **resetInstance**(): `void`

Defined in: [core/modal/src/lib/client/client.ts:583](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/client.ts#L583)

**`Internal`**

Resets the singleton instance.

#### Returns

`void`

#### Remarks

- Resets the current instance's state
- Clears the singleton instance
- Primarily used for testing
