[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / DiscoveryService

# Class: DiscoveryService

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:200

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

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:230

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

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:348

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

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:385

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

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:336

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

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:459

Clean up discovery service resources

#### Returns

`Promise`\<`void`\>

***

### getAvailableWallets()

> **getAvailableWallets**(): [`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)[]

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:263

Get available discovered wallets

#### Returns

[`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)[]

Array of available discovered wallets

***

### getChromeExtensionWallets()

> **getChromeExtensionWallets**(): `DiscoveryResult`[]

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:376

Get Chrome extension wallets

#### Returns

`DiscoveryResult`[]

***

### getConnectedWallets()

> **getConnectedWallets**(): `ConnectionState`[]

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:416

Get all connected wallets

#### Returns

`ConnectionState`[]

Array of connected wallet states

***

### getConnectionState()

> **getConnectionState**(`walletId`): `undefined` \| `ConnectionState`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:409

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

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:361

Get all discovered wallet adapters

#### Returns

`DiscoveryAdapter`[]

***

### getDiscoveredWallet()

> **getDiscoveredWallet**(`walletId`): `undefined` \| [`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:271

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

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:256

Get all discovered wallets

#### Returns

[`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)[]

Array of discovered wallets

***

### getOrCreateAdapter()

> **getOrCreateAdapter**(`walletId`): `Promise`\<[`WalletAdapter`](../interfaces/WalletAdapter.md)\>

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:343

Get or create wallet adapter

#### Parameters

##### walletId

`string`

#### Returns

`Promise`\<[`WalletAdapter`](../interfaces/WalletAdapter.md)\>

***

### getQualifiedWallet()

> **getQualifiedWallet**(`walletId`): `undefined` \| `QualifiedResponder`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:401

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

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:431

Get session recovery information

#### Returns

`object`[]

Array of recoverable sessions

***

### getSecureSessions()

> **getSecureSessions**(): `SecureSession`[]

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:442

Get secure sessions for current origin

#### Returns

`SecureSession`[]

Array of secure sessions

***

### getWalletAdapter()

> **getWalletAdapter**(`walletId`): `Promise`\<`null` \| [`WalletAdapter`](../interfaces/WalletAdapter.md)\>

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:356

Get a specific wallet adapter

#### Parameters

##### walletId

`string`

#### Returns

`Promise`\<`null` \| [`WalletAdapter`](../interfaces/WalletAdapter.md)\>

***

### getWalletsByChain()

> **getWalletsByChain**(`chainType`): `DiscoveryResult`[]

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:366

Get wallet by chain support

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

#### Returns

`DiscoveryResult`[]

***

### getWalletsByTransportType()

> **getWalletsByTransportType**(`transportType`): `DiscoveryResult`[]

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:371

Get wallets by transport type

#### Parameters

##### transportType

`"extension"` | `"injected"` | `"popup"` | `"websocket"`

#### Returns

`DiscoveryResult`[]

***

### getWalletsWithTransport()

> **getWalletsWithTransport**(): `QualifiedResponder`[]

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:331

Get all wallets with transport configuration

#### Returns

`QualifiedResponder`[]

***

### getWalletWithTransport()

> **getWalletWithTransport**(`walletId`): `undefined` \| `QualifiedResponder`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:326

Get wallet information with transport configuration

#### Parameters

##### walletId

`string`

#### Returns

`undefined` \| `QualifiedResponder`

***

### initializeDiscovery()

> **initializeDiscovery**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:240

Prepare discovery components without starting a scan.
Allows callers to set up responders ahead of invoking `scan()`.

#### Returns

`Promise`\<`void`\>

***

### isWalletAvailable()

> **isWalletAvailable**(`walletId`): `boolean`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:279

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

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:424

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

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:296

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

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:305

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

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:313

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

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:287

Force refresh of a specific wallet's availability

#### Parameters

##### walletId

`string`

ID of the wallet to refresh

#### Returns

`Promise`\<`null` \| [`DiscoveredWallet`](../interfaces/DiscoveredWallet.md)\>

Promise that resolves to updated wallet info

***

### reset()

> **reset**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:320

Reset discovery service to initial state for fresh discovery
This allows the service to be reused for multiple discovery sessions

#### Returns

`Promise`\<`void`\>

***

### scan()

> **scan**(`config?`): `Promise`\<`DiscoveryResult`[]\>

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:249

Execute a discovery scan and register discovered wallets.

The optional config parameter replaces the service configuration for this scan,
allowing callers to run targeted discovery passes without mutating previous state.

#### Parameters

##### config?

[`DiscoveryConfig`](../interfaces/DiscoveryConfig.md)

#### Returns

`Promise`\<`DiscoveryResult`[]\>

***

### validateSecureSession()

> **validateSecureSession**(`sessionId`): `object`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:450

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
