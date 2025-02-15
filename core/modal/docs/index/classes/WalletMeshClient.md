[**@walletmesh/modal v0.0.6**](../../README.md)

***

[@walletmesh/modal](../../modules.md) / [index](../README.md) / WalletMeshClient

# Class: WalletMeshClient

Defined in: [core/modal/src/lib/client/client.ts:56](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/client/client.ts#L56)

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

Defined in: [core/modal/src/lib/client/client.ts:85](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/client/client.ts#L85)

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

Defined in: [core/modal/src/lib/client/client.ts:215](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/client/client.ts#L215)

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

Defined in: [core/modal/src/lib/client/client.ts:286](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/client/client.ts#L286)

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

Defined in: [core/modal/src/lib/client/client.ts:317](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/client/client.ts#L317)

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

Defined in: [core/modal/src/lib/client/client.ts:367](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/client/client.ts#L367)

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

### getProvider()

> **getProvider**(`walletId`): `Promise`\<`unknown`\>

Defined in: [core/modal/src/lib/client/client.ts:409](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/client/client.ts#L409)

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

[`WalletClient`](../../lib/client/types/interfaces/WalletClient.md).[`getProvider`](../../lib/client/types/interfaces/WalletClient.md#getprovider)

***

### getConnectedWallets()

> **getConnectedWallets**(): [`ConnectedWallet`](../interfaces/ConnectedWallet.md)[]

Defined in: [core/modal/src/lib/client/client.ts:457](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/client/client.ts#L457)

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

Defined in: [core/modal/src/lib/client/client.ts:480](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/client/client.ts#L480)

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

### handleError()

> **handleError**(`error`): `void`

Defined in: [core/modal/src/lib/client/client.ts:495](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/client/client.ts#L495)

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

[`WalletClient`](../../lib/client/types/interfaces/WalletClient.md).[`handleError`](../../lib/client/types/interfaces/WalletClient.md#handleerror)

***

### prepareForTransition()

> **prepareForTransition**(): `void`

Defined in: [core/modal/src/lib/client/client.ts:510](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/client/client.ts#L510)

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

Defined in: [core/modal/src/lib/client/client.ts:530](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/client/client.ts#L530)

#### Returns

`void`

#### Deprecated

Use [prepareForTransition](WalletMeshClient.md#preparefortransition) instead
Legacy method for backwards compatibility

***

### resetInstance()

> `static` **resetInstance**(): `void`

Defined in: [core/modal/src/lib/client/client.ts:545](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/client/client.ts#L545)

**`Internal`**

Resets the singleton instance.

#### Returns

`void`

#### Remarks

- Resets the current instance's state
- Clears the singleton instance
- Primarily used for testing
