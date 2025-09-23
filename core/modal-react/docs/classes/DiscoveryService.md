[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / DiscoveryService

# Class: DiscoveryService

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:203

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

// Start discovery
await discoveryService.start();

// Get discovery results with adapters
const results = await discoveryService.discoverWallets();
results.forEach(result => {
  console.log('Wallet:', result.wallet.name, 'Adapter:', result.adapter?.id);
});
```

## Constructors

### Constructor

> **new DiscoveryService**(`config`, `registry`, `logger`, `_adapterRegistry?`, `connectionManager?`): `DiscoveryService`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:227

#### Parameters

##### config

[`DiscoveryConfig`](../interfaces/DiscoveryConfig.md)

##### registry

[`WalletRegistry`](WalletRegistry.md)

##### logger

[`Logger`](../interfaces/Logger.md)

##### \_adapterRegistry?

`unknown`

##### connectionManager?

`DiscoveryConnectionManager`

#### Returns

`DiscoveryService`

## Methods

### connectAndGetAdapter()

> **connectAndGetAdapter**(`walletId`, `options?`): `Promise`\<[`WalletAdapter`](../interfaces/WalletAdapter.md)\>

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:345

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

`Promise`\<[`WalletAdapter`](../interfaces/WalletAdapter.md)\>

***

### connectToWallet()

> **connectToWallet**(`walletId`, `options?`): `Promise`\<\{ `chains`: `string`[]; `rdns`: `string`; `sessionId`: `string`; `walletId`: `string`; \}\>

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:392

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

`Promise`\<\{ `chains`: `string`[]; `rdns`: `string`; `sessionId`: `string`; `walletId`: `string`; \}\>

Promise that resolves to connection details

***

### createWalletAdapter()

> **createWalletAdapter**(`walletId`, `config?`): `Promise`\<[`WalletAdapter`](../interfaces/WalletAdapter.md)\>

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:333

Create a wallet adapter for a discovered wallet

#### Parameters

##### walletId

`string`

##### config?

###### autoConnect?

`boolean`

#### Returns

`Promise`\<[`WalletAdapter`](../interfaces/WalletAdapter.md)\>

***

### destroy()

> **destroy**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:466

Clean up discovery service resources

#### Returns

`Promise`\<`void`\>

***

### discover()

> **discover**(): `Promise`\<[`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)[]\>

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:248

Perform a one-time discovery scan

#### Returns

`Promise`\<[`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)[]\>

Promise that resolves to discovered wallets

***

### discoverWallets()

> **discoverWallets**(`chainTypes?`): `Promise`\<`DiscoveryResult`[]\>

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:318

Discover wallets for specified chain types
Enhanced version that returns DiscoveryResult with adapters

#### Parameters

##### chainTypes?

[`ChainType`](../enumerations/ChainType.md)[]

#### Returns

`Promise`\<`DiscoveryResult`[]\>

***

### getAvailableWallets()

> **getAvailableWallets**(): [`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)[]

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:262

Get available discovered wallets

#### Returns

[`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)[]

Array of available discovered wallets

***

### getChromeExtensionWallets()

> **getChromeExtensionWallets**(): `DiscoveryResult`[]

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:373

Get Chrome extension wallets

#### Returns

`DiscoveryResult`[]

***

### getConnectedWallets()

> **getConnectedWallets**(): `ConnectionState`[]

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:423

Get all connected wallets

#### Returns

`ConnectionState`[]

Array of connected wallet states

***

### getConnectionState()

> **getConnectionState**(`walletId`): `undefined` \| `ConnectionState`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:416

Get connection state for a wallet

#### Parameters

##### walletId

`string`

The ID of the wallet

#### Returns

`undefined` \| `ConnectionState`

Connection state or undefined

***

### getDiscoveredAdapters()

> **getDiscoveredAdapters**(): `DiscoveryAdapter`[]

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:358

Get all discovered wallet adapters

#### Returns

`DiscoveryAdapter`[]

***

### getDiscoveredWallet()

> **getDiscoveredWallet**(`walletId`): `undefined` \| [`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:270

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

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:255

Get all discovered wallets

#### Returns

[`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)[]

Array of discovered wallets

***

### getOrCreateAdapter()

> **getOrCreateAdapter**(`walletId`): `Promise`\<[`WalletAdapter`](../interfaces/WalletAdapter.md)\>

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:340

Get or create wallet adapter

#### Parameters

##### walletId

`string`

#### Returns

`Promise`\<[`WalletAdapter`](../interfaces/WalletAdapter.md)\>

***

### getQualifiedWallet()

> **getQualifiedWallet**(`walletId`): `undefined` \| `QualifiedResponder`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:408

Get the qualified wallet information for a discovered wallet

#### Parameters

##### walletId

`string`

ID of the wallet

#### Returns

`undefined` \| `QualifiedResponder`

Qualified wallet information or undefined

***

### getRecoverableSessions()

> **getRecoverableSessions**(): `object`[]

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:438

Get session recovery information

#### Returns

`object`[]

Array of recoverable sessions

***

### getSecureSessions()

> **getSecureSessions**(): `SecureSession`[]

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:449

Get secure sessions for current origin

#### Returns

`SecureSession`[]

Array of secure sessions

***

### getWalletAdapter()

> **getWalletAdapter**(`walletId`): `Promise`\<`null` \| [`WalletAdapter`](../interfaces/WalletAdapter.md)\>

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:353

Get a specific wallet adapter

#### Parameters

##### walletId

`string`

#### Returns

`Promise`\<`null` \| [`WalletAdapter`](../interfaces/WalletAdapter.md)\>

***

### getWalletsByChain()

> **getWalletsByChain**(`chainType`): `DiscoveryResult`[]

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:363

Get wallet by chain support

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

#### Returns

`DiscoveryResult`[]

***

### getWalletsByTransportType()

> **getWalletsByTransportType**(`transportType`): `DiscoveryResult`[]

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:368

Get wallets by transport type

#### Parameters

##### transportType

`"extension"` | `"injected"` | `"popup"` | `"websocket"`

#### Returns

`DiscoveryResult`[]

***

### getWalletsWithTransport()

> **getWalletsWithTransport**(): `QualifiedResponder`[]

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:328

Get all wallets with transport configuration

#### Returns

`QualifiedResponder`[]

***

### getWalletWithTransport()

> **getWalletWithTransport**(`walletId`): `undefined` \| `QualifiedResponder`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:323

Get wallet information with transport configuration

#### Parameters

##### walletId

`string`

#### Returns

`undefined` \| `QualifiedResponder`

***

### isWalletAvailable()

> **isWalletAvailable**(`walletId`): `boolean`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:278

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

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:431

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

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:295

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

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:304

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

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:312

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

> **refreshWallet**(`walletId`): `Promise`\<`null` \| [`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)\>

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:286

Force refresh of a specific wallet's availability

#### Parameters

##### walletId

`string`

ID of the wallet to refresh

#### Returns

`Promise`\<`null` \| [`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)\>

Promise that resolves to updated wallet info

***

### start()

> **start**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:234

Start the discovery service

#### Returns

`Promise`\<`void`\>

Promise that resolves when discovery is started

***

### startContinuousDiscovery()

> **startContinuousDiscovery**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:378

Start continuous discovery

#### Returns

`Promise`\<`void`\>

***

### stop()

> **stop**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:241

Stop the discovery service

#### Returns

`Promise`\<`void`\>

Promise that resolves when discovery is stopped

***

### stopContinuousDiscovery()

> **stopContinuousDiscovery**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:383

Stop continuous discovery

#### Returns

`Promise`\<`void`\>

***

### validateSecureSession()

> **validateSecureSession**(`sessionId`): `object`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:457

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
