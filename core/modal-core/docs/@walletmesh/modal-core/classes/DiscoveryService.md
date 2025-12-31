[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DiscoveryService

# Class: DiscoveryService

Unified Discovery Service class for comprehensive wallet discovery

Consolidates functionality from:
- Base DiscoveryService: Core discovery functionality
- TransportDiscoveryService: Transport configuration extraction
- DiscoveryService wrapper: Adapter creation and management

## Example

```typescript
const discoveryService = new DiscoveryService(config, registry, logger);

// Listen for discovered wallets
discoveryService.on('wallet_discovered', (event) => {
  console.log('Found wallet:', event.wallet.name);
});

// Listen for enhanced transport events
discoveryService.onEnhanced('adapter_created', (event) => {
  console.log('Adapter created:', event.adapter.id);
});

// Run a discovery scan (optionally provide a config override)
const results = await discoveryService.scan();
results.forEach(result => {
  console.log('Wallet:', result.wallet.name, 'Adapter:', result.adapter?.id);
});
```

## Constructors

### Constructor

> **new DiscoveryService**(`config`, `registry`, `logger`, `_adapterRegistry?`, `connectionManager?`): `DiscoveryService`

#### Parameters

##### config

[`DiscoveryConfig`](../interfaces/DiscoveryConfig.md)

##### registry

[`WalletRegistry`](WalletRegistry.md)

##### logger

[`Logger`](Logger.md)

##### \_adapterRegistry?

`unknown`

##### connectionManager?

[`DiscoveryConnectionManager`](../interfaces/DiscoveryConnectionManager.md)

#### Returns

`DiscoveryService`

## Properties

### connectionManager

> `protected` **connectionManager**: `null` \| [`DiscoveryConnectionManager`](../interfaces/DiscoveryConnectionManager.md) = `null`

***

### logger

> `protected` `readonly` **logger**: [`Logger`](Logger.md)

***

### qualifiedWallets

> `protected` **qualifiedWallets**: [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, [`QualifiedWallet`](../interfaces/QualifiedWallet.md)\>

## Methods

### connectAndGetAdapter()

> **connectAndGetAdapter**(`walletId`, `options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletAdapter`](../interfaces/WalletAdapter.md)\>

Connect to wallet and get adapter

#### Parameters

##### walletId

`string`

##### options?

###### requestedChains?

`string`[]

###### requestedPermissions?

`string`[]

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletAdapter`](../interfaces/WalletAdapter.md)\>

***

### connectToWallet()

> **connectToWallet**(`walletId`, `options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `chains`: `string`[]; `rdns`: `string`; `sessionId`: `string`; `walletId`: `string`; \}\>

Connect to a discovered wallet using the discovery protocol

#### Parameters

##### walletId

`string`

ID of the wallet to connect to

##### options?

Connection options

###### requestedChains?

`string`[]

###### requestedPermissions?

`string`[]

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `chains`: `string`[]; `rdns`: `string`; `sessionId`: `string`; `walletId`: `string`; \}\>

Promise that resolves to connection details

***

### createWalletAdapter()

> **createWalletAdapter**(`walletId`, `config?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletAdapter`](../interfaces/WalletAdapter.md)\>

Create a wallet adapter for a discovered wallet

#### Parameters

##### walletId

`string`

##### config?

###### autoConnect?

`boolean`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletAdapter`](../interfaces/WalletAdapter.md)\>

***

### destroy()

> **destroy**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Clean up discovery service resources

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### getAvailableWallets()

> **getAvailableWallets**(): [`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)[]

Get available discovered wallets

#### Returns

[`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)[]

Array of available discovered wallets

***

### getChromeExtensionWallets()

> **getChromeExtensionWallets**(): [`DiscoveryResult`](../interfaces/DiscoveryResult.md)[]

Get Chrome extension wallets

#### Returns

[`DiscoveryResult`](../interfaces/DiscoveryResult.md)[]

***

### getConnectedWallets()

> **getConnectedWallets**(): [`DiscoveryConnectionState`](../interfaces/DiscoveryConnectionState.md)[]

Get all connected wallets

#### Returns

[`DiscoveryConnectionState`](../interfaces/DiscoveryConnectionState.md)[]

Array of connected wallet states

***

### getConnectionManager()

> **getConnectionManager**(): `null` \| [`DiscoveryConnectionManager`](../interfaces/DiscoveryConnectionManager.md)

Get the connection manager for creating adapters

#### Returns

`null` \| [`DiscoveryConnectionManager`](../interfaces/DiscoveryConnectionManager.md)

The connection manager instance, or null if not initialized

***

### getConnectionState()

> **getConnectionState**(`walletId`): `undefined` \| [`DiscoveryConnectionState`](../interfaces/DiscoveryConnectionState.md)

Get connection state for a wallet

#### Parameters

##### walletId

`string`

The ID of the wallet

#### Returns

`undefined` \| [`DiscoveryConnectionState`](../interfaces/DiscoveryConnectionState.md)

Connection state or undefined

***

### getDiscoveredAdapters()

> **getDiscoveredAdapters**(): [`DiscoveryAdapter`](DiscoveryAdapter.md)[]

Get all discovered wallet adapters

#### Returns

[`DiscoveryAdapter`](DiscoveryAdapter.md)[]

***

### getDiscoveredWallet()

> **getDiscoveredWallet**(`walletId`): `undefined` \| [`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)

Get a specific discovered wallet

#### Parameters

##### walletId

`string`

ID of the wallet to get

#### Returns

`undefined` \| [`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)

Discovered wallet or undefined if not found

***

### getDiscoveredWallets()

> **getDiscoveredWallets**(): [`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)[]

Get all discovered wallets

#### Returns

[`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)[]

Array of discovered wallets

***

### getOrCreateAdapter()

> **getOrCreateAdapter**(`walletId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletAdapter`](../interfaces/WalletAdapter.md)\>

Get or create wallet adapter

#### Parameters

##### walletId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletAdapter`](../interfaces/WalletAdapter.md)\>

***

### getQualifiedWallet()

> **getQualifiedWallet**(`walletId`): `undefined` \| [`QualifiedWallet`](../interfaces/QualifiedWallet.md)

Get the qualified wallet information for a discovered wallet

#### Parameters

##### walletId

`string`

ID of the wallet

#### Returns

`undefined` \| [`QualifiedWallet`](../interfaces/QualifiedWallet.md)

Qualified wallet information or undefined

***

### getRecoverableSessions()

> **getRecoverableSessions**(): `object`[]

Get session recovery information

#### Returns

`object`[]

Array of recoverable sessions

***

### getSecureSessions()

> **getSecureSessions**(): [`SecureSession`](../interfaces/SecureSession.md)[]

Get secure sessions for current origin

#### Returns

[`SecureSession`](../interfaces/SecureSession.md)[]

Array of secure sessions

***

### getWalletAdapter()

> **getWalletAdapter**(`walletId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`null` \| [`WalletAdapter`](../interfaces/WalletAdapter.md)\>

Get a specific wallet adapter

#### Parameters

##### walletId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`null` \| [`WalletAdapter`](../interfaces/WalletAdapter.md)\>

***

### getWalletsByChain()

> **getWalletsByChain**(`chainType`): [`DiscoveryResult`](../interfaces/DiscoveryResult.md)[]

Get wallet by chain support

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

#### Returns

[`DiscoveryResult`](../interfaces/DiscoveryResult.md)[]

***

### getWalletsByTransportType()

> **getWalletsByTransportType**(`transportType`): [`DiscoveryResult`](../interfaces/DiscoveryResult.md)[]

Get wallets by transport type

#### Parameters

##### transportType

`"extension"` | `"popup"` | `"websocket"` | `"injected"`

#### Returns

[`DiscoveryResult`](../interfaces/DiscoveryResult.md)[]

***

### getWalletsWithTransport()

> **getWalletsWithTransport**(): [`QualifiedWallet`](../interfaces/QualifiedWallet.md)[]

Get all wallets with transport configuration

#### Returns

[`QualifiedWallet`](../interfaces/QualifiedWallet.md)[]

***

### getWalletWithTransport()

> **getWalletWithTransport**(`walletId`): `undefined` \| [`QualifiedWallet`](../interfaces/QualifiedWallet.md)

Get wallet information with transport configuration

#### Parameters

##### walletId

`string`

#### Returns

`undefined` \| [`QualifiedWallet`](../interfaces/QualifiedWallet.md)

***

### initializeDiscovery()

> **initializeDiscovery**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Prepare discovery components without starting a scan.
Allows callers to set up responders ahead of invoking `scan()`.

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### isWalletAvailable()

> **isWalletAvailable**(`walletId`): `boolean`

Check if a wallet is available

#### Parameters

##### walletId

`string`

ID of the wallet to check

#### Returns

`boolean`

True if wallet is available

***

### isWalletConnected()

> **isWalletConnected**(`walletId`): `boolean`

Check if a wallet is connected

#### Parameters

##### walletId

`string`

The ID of the wallet

#### Returns

`boolean`

True if connected

***

### on()

> **on**(`event`, `handler`): () => `void`

Subscribe to discovery events

#### Parameters

##### event

Event type to listen for

`"discovery_started"` | `"discovery_completed"` | `"wallet_discovered"` | `"wallet_available"` | `"wallet_unavailable"` | `"discovery_error"` | `"announcement_sent"` | `"announcement_received"`

##### handler

(`event`) => `void`

Event handler function

#### Returns

Unsubscribe function

> (): `void`

##### Returns

`void`

***

### once()

> **once**(`event`, `handler`): () => `void`

Subscribe to discovery events once

#### Parameters

##### event

Event type to listen for

`"discovery_started"` | `"discovery_completed"` | `"wallet_discovered"` | `"wallet_available"` | `"wallet_unavailable"` | `"discovery_error"` | `"announcement_sent"` | `"announcement_received"`

##### handler

(`event`) => `void`

Event handler function

#### Returns

Unsubscribe function

> (): `void`

##### Returns

`void`

***

### onEnhanced()

> **onEnhanced**(`event`, `handler`): () => `void`

Subscribe to enhanced discovery events

#### Parameters

##### event

Event type to listen for

`"wallet_discovered_with_transport"` | `"wallet_registered"` | `"transport_extracted"`

##### handler

(`event`) => `void`

Event handler function

#### Returns

Unsubscribe function

> (): `void`

##### Returns

`void`

***

### refreshWallet()

> **refreshWallet**(`walletId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`null` \| [`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)\>

Force refresh of a specific wallet's availability

#### Parameters

##### walletId

`string`

ID of the wallet to refresh

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`null` \| [`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)\>

Promise that resolves to updated wallet info

***

### reset()

> **reset**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Reset discovery service to initial state for fresh discovery
This allows the service to be reused for multiple discovery sessions

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### scan()

> **scan**(`config?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`DiscoveryResult`](../interfaces/DiscoveryResult.md)[]\>

Execute a discovery scan and register discovered wallets.

The optional config parameter replaces the service configuration for this scan,
allowing callers to run targeted discovery passes without mutating previous state.

#### Parameters

##### config?

[`DiscoveryConfig`](../interfaces/DiscoveryConfig.md)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`DiscoveryResult`](../interfaces/DiscoveryResult.md)[]\>

***

### validateSecureSession()

> **validateSecureSession**(`sessionId`): `object`

Validate a secure session

#### Parameters

##### sessionId

`string`

Session ID to validate

#### Returns

`object`

Validation result

##### reason?

> `optional` **reason**: `string`

##### valid

> **valid**: `boolean`
