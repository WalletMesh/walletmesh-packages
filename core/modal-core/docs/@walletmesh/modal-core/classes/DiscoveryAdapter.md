[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DiscoveryAdapter

# Class: DiscoveryAdapter

Generic adapter that automatically configures transports and providers
based on discovered wallet metadata. Supports all chain types.

## Extends

- [`AbstractWalletAdapter`](AbstractWalletAdapter.md)

## Constructors

### Constructor

> **new DiscoveryAdapter**(`adapterDataOrResponder`, `connectionManager`, `config`): `DiscoveryAdapter`

Create a DiscoveryAdapter

#### Parameters

##### adapterDataOrResponder

`unknown`

Either minimal DiscoveryAdapterData or full QualifiedResponder

##### connectionManager

[`DiscoveryConnectionManager`](../interfaces/DiscoveryConnectionManager.md)

Connection manager for discovery protocol

##### config

[`DiscoveryAdapterConfig`](../interfaces/DiscoveryAdapterConfig.md) = `{}`

Optional adapter configuration

#### Returns

`DiscoveryAdapter`

#### Overrides

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`constructor`](AbstractWalletAdapter.md#constructor)

## Properties

### capabilities

> `readonly` **capabilities**: [`WalletCapabilities`](../interfaces/WalletCapabilities.md)

Capabilities and requirements of this wallet

#### Overrides

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`capabilities`](AbstractWalletAdapter.md#capabilities)

***

### debug

> `protected` **debug**: `boolean` = `false`

Debug mode

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`debug`](AbstractWalletAdapter.md#debug)

***

### eventEmitter

> `protected` `readonly` **eventEmitter**: [`EventEmitter`](../../../internal/types/typedocExports/classes/EventEmitter.md)

Event emitter for adapter events

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`eventEmitter`](AbstractWalletAdapter.md#eventemitter)

***

### id

> `readonly` **id**: `string`

Unique identifier for this wallet

#### Overrides

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`id`](AbstractWalletAdapter.md#id)

***

### logger?

> `protected` `optional` **logger**: `object`

Logger instance

#### debug()

> **debug**(`message`, ...`args`): `void`

##### Parameters

###### message

`string`

###### args

...`unknown`[]

##### Returns

`void`

#### error()

> **error**(`message`, `error?`): `void`

##### Parameters

###### message

`string`

###### error?

`unknown`

##### Returns

`void`

#### info()

> **info**(`message`, ...`args`): `void`

##### Parameters

###### message

`string`

###### args

...`unknown`[]

##### Returns

`void`

#### warn()

> **warn**(`message`, ...`args`): `void`

##### Parameters

###### message

`string`

###### args

...`unknown`[]

##### Returns

`void`

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`logger`](AbstractWalletAdapter.md#logger)

***

### metadata

> `readonly` **metadata**: [`WalletAdapterMetadata`](../interfaces/WalletAdapterMetadata.md)

Display metadata for the wallet

#### Overrides

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`metadata`](AbstractWalletAdapter.md#metadata)

***

### persistedSession

> `protected` **persistedSession**: `undefined` \| [`SessionState`](../interfaces/SessionState.md)

Cached persisted session data from Zustand store

This field stores a SessionState object that was loaded from the Zustand store
during the `install()` lifecycle method. It enables adapters to detect and
restore previous wallet connections across page refreshes.

**Architecture Note**: Prior to the Zustand migration (2025-01), adapters used
WalletStorage with a separate AdapterSessionData interface. Now, adapters access
the full SessionState from the unified Zustand store, providing richer context
for reconnection flows.

**Usage Pattern**:
1. `install()` calls `restoreSession()` which populates this field
2. Subclass `connect()` methods can check this field to enable auto-reconnect
3. `cleanup()` clears this field on disconnect

#### See

 - [restoreSession](AbstractWalletAdapter.md#restoresession) for how this field is populated
 - [persistSession](AbstractWalletAdapter.md#persistsession) for how session data is saved to the store
 - [getPersistedSession](AbstractWalletAdapter.md#getpersistedsession) for accessing this field

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`persistedSession`](AbstractWalletAdapter.md#persistedsession)

***

### providers

> `protected` **providers**: [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)\<[`ChainType`](../enumerations/ChainType.md), [`WalletProvider`](../../../internal/types/typedocExports/type-aliases/WalletProvider.md)\>

Active provider instances by chain type

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`providers`](AbstractWalletAdapter.md#providers)

***

### supportedProviders

> `readonly` **supportedProviders**: `Partial`\<`Record`\<[`ChainType`](../enumerations/ChainType.md), [`ProviderClass`](../type-aliases/ProviderClass.md)\>\> = `{}`

Default supported providers - empty by default
Override in subclasses to specify supported provider classes

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`supportedProviders`](AbstractWalletAdapter.md#supportedproviders)

***

### transport

> `protected` **transport**: `null` \| [`Transport`](../interfaces/Transport.md) = `null`

Active transport instance

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`transport`](AbstractWalletAdapter.md#transport)

## Accessors

### state

#### Get Signature

> **get** **state**(): [`WalletAdapterConnectionState`](../interfaces/WalletAdapterConnectionState.md)

Get current connection state (read-only)

##### Returns

[`WalletAdapterConnectionState`](../interfaces/WalletAdapterConnectionState.md)

Current connection state

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`state`](AbstractWalletAdapter.md#state)

## Methods

### cleanup()

> `protected` **cleanup**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

INFRASTRUCTURE HELPER: Clean up all resources

Performs comprehensive cleanup of adapter resources including Zustand store
session removal, provider cleanup, transport cleanup, and state reset.
Called automatically on `disconnect()` and `uninstall()`.

**Zustand Store Integration**: This method removes all sessions for this wallet
from the Zustand store, ensuring that persisted session data is cleared when
the user explicitly disconnects. The store access is wrapped in a try-catch to
gracefully handle test environments where the store may not be fully initialized.

**Cleanup Order**:
1. Remove sessions from Zustand store (with graceful fallback)
2. Clear cached persisted session reference
3. Clean up wallet providers
4. Clean up transport connections
5. Remove all event listeners
6. Reset connection state to disconnected

**Error Handling Strategy**: Uses nested try-catch blocks:
- Inner try-catch: Handles Zustand store access failures (e.g., in tests)
- Outer try-catch: Handles any unexpected errors during cleanup

This ensures cleanup continues even if individual steps fail, preventing
resource leaks in edge cases.

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### See

 - cleanupProviders for provider cleanup details
 - cleanupTransport for transport cleanup details
 - [persistSession](AbstractWalletAdapter.md#persistsession) for how sessions are saved

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`cleanup`](AbstractWalletAdapter.md#cleanup)

***

### connect()

> **connect**(`options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletConnection`](../interfaces/WalletConnection.md)\>

Connect to the wallet using the discovery protocol

#### Parameters

##### options?

[`ConnectOptions`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletConnection`](../interfaces/WalletConnection.md)\>

#### Overrides

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`connect`](AbstractWalletAdapter.md#connect)

***

### createConnection()

> `protected` **createConnection**(`params`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletConnection`](../interfaces/WalletConnection.md)\>

INFRASTRUCTURE HELPER: Create connection object
Automatically updates state and emits events

#### Parameters

##### params

Connection parameters

###### accounts

`string`[]

###### address

`string`

###### chainId

`string`

###### chainName?

`string`

###### chainRequired?

`boolean`

###### chainType

[`ChainType`](../enumerations/ChainType.md)

###### features?

`string`[]

###### provider

[`WalletProvider`](../../../internal/types/typedocExports/type-aliases/WalletProvider.md)

###### providerType?

`string`

###### sessionId?

`string`

###### sessionMetadata?

`Record`\<`string`, `unknown`\>

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletConnection`](../interfaces/WalletConnection.md)\>

WalletConnection object

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`createConnection`](AbstractWalletAdapter.md#createconnection)

***

### createProvider()

> `protected` **createProvider**\<`T`\>(`ProviderClass`, `transport`, `chainType`, `chainId?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

INFRASTRUCTURE HELPER: Instantiate a blockchain provider with established transport

This method creates the PROVIDER (blockchain API layer) using the TRANSPORT
that the adapter has established. This is the key integration point between
the connection layer (adapter) and the API layer (provider).

ARCHITECTURAL NOTE:
- Adapter establishes HOW to communicate (transport to wallet)
- Provider implements WHAT to communicate (blockchain operations)
- This method connects them: Provider + Transport = Functional blockchain API

#### Type Parameters

##### T

`T` *extends* [`WalletProvider`](../../../internal/types/typedocExports/type-aliases/WalletProvider.md)

#### Parameters

##### ProviderClass

[`ProviderClass`](../type-aliases/ProviderClass.md)

Provider class that implements blockchain API

##### transport

Transport established by this adapter

`JSONRPCTransport` | [`Transport`](../interfaces/Transport.md)

##### chainType

[`ChainType`](../enumerations/ChainType.md)

Type of blockchain (EVM, Solana, Aztec)

##### chainId?

`string`

Optional specific chain ID

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Provider instance ready for blockchain operations

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`createProvider`](AbstractWalletAdapter.md#createprovider)

***

### createTransport()

> `protected` **createTransport**(`type`, `config`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Transport`](../interfaces/Transport.md)\>

INFRASTRUCTURE HELPER: Create transport instance

Handles transport lifecycle and cleanup automatically. Subclasses should use
this method instead of creating transports directly to ensure proper
lifecycle management and error handling.

#### Parameters

##### type

[`TransportType`](../enumerations/TransportType.md)

Transport type ('popup' | 'extension')

##### config

`Record`\<`string`, `unknown`\> = `{}`

Transport-specific configuration

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Transport`](../interfaces/Transport.md)\>

Transport instance ready for use

#### Example

```typescript
protected async doConnect(options?: ConnectOptions): Promise<WalletConnection> {
  // Create popup transport
  const transport = await this.createTransport('popup', {
    url: 'https://wallet.example.com',
    width: 400,
    height: 600
  });

  // Transport is automatically managed
  const provider = await this.createProvider(EvmProvider, transport);
  // ...
}
```

#### Throws

Transport error if creation fails

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`createTransport`](AbstractWalletAdapter.md#createtransport)

***

### detect()

> **detect**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`DetectionResult`](../interfaces/DetectionResult.md)\>

Detect if discovery wallet is available

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`DetectionResult`](../interfaces/DetectionResult.md)\>

#### Overrides

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`detect`](AbstractWalletAdapter.md#detect)

***

### disconnect()

> **disconnect**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Disconnect from the wallet

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Overrides

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`disconnect`](AbstractWalletAdapter.md#disconnect)

***

### emitBlockchainEvent()

> `protected` **emitBlockchainEvent**(`event`, `data`): `void`

INFRASTRUCTURE HELPER: Emit blockchain events
Use this instead of direct state updates

#### Parameters

##### event

Event type (without 'wallet:' prefix)

`"disconnected"` | `"connected"` | `"accountsChanged"` | `"chainChanged"` | `"statusChanged"` | `"sessionTerminated"`

##### data

`unknown`

Event data

#### Returns

`void`

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`emitBlockchainEvent`](AbstractWalletAdapter.md#emitblockchainevent)

***

### generateSessionId()

> `protected` **generateSessionId**(): `string`

Generate a unique session ID for wallet connections

#### Returns

`string`

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`generateSessionId`](AbstractWalletAdapter.md#generatesessionid)

***

### getJSONRPCTransport()?

> `optional` **getJSONRPCTransport**(`_chainType`): `undefined` \| `JSONRPCTransport`

Default implementation returns undefined
Override in subclasses to provide JSON-RPC transport

#### Parameters

##### \_chainType

[`ChainType`](../enumerations/ChainType.md)

The chain type to get transport for

#### Returns

`undefined` \| `JSONRPCTransport`

JSON-RPC transport instance or undefined if not supported

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`getJSONRPCTransport`](AbstractWalletAdapter.md#getjsonrpctransport)

***

### getPersistedSession()

> `protected` **getPersistedSession**(): `undefined` \| [`SessionState`](../interfaces/SessionState.md)

Get the persisted session data if available

Returns the SessionState that was loaded from the Zustand store during
`install()`. This provides access to previously persisted wallet connection
data for implementing auto-reconnect flows.

**Usage**: Subclasses typically call this method in their `connect()` implementation
to check if a previous session exists and attempt automatic reconnection.

#### Returns

`undefined` \| [`SessionState`](../interfaces/SessionState.md)

The persisted SessionState from the Zustand store, or undefined if no session was found

#### See

 - [restoreSession](AbstractWalletAdapter.md#restoresession) for how this field is populated
 - [persistedSession](AbstractWalletAdapter.md#persistedsession) for the internal storage field

#### Example

```typescript
async connect(options?: ConnectOptions): Promise<WalletConnection> {
  // Check for persisted session to enable auto-reconnect
  const persistedSession = this.getPersistedSession();

  if (persistedSession && !options?.forceNew) {
    this.log('info', 'Found persisted session, attempting auto-reconnect');
    try {
      return await this.reconnectWithSession(persistedSession);
    } catch (error) {
      this.log('warn', 'Auto-reconnect failed, proceeding with new connection', error);
    }
  }

  // Normal connection flow
  return await this.doConnect(options);
}
```

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`getPersistedSession`](AbstractWalletAdapter.md#getpersistedsession)

***

### getProvider()

> **getProvider**(`chainType`): [`WalletProvider`](../../../internal/types/typedocExports/type-aliases/WalletProvider.md)

Get provider for a specific chain type

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

Type of blockchain

#### Returns

[`WalletProvider`](../../../internal/types/typedocExports/type-aliases/WalletProvider.md)

Provider instance

#### Throws

If chain type not supported or not connected

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`getProvider`](AbstractWalletAdapter.md#getprovider)

***

### getTransportConfig()

> **getTransportConfig**(): `unknown`

Get transport config for debugging

#### Returns

`unknown`

***

### getWalletMetadata()

> **getWalletMetadata**(): `undefined` \| [`QualifiedWallet`](../interfaces/QualifiedWallet.md)

Get the discovered wallet metadata
Returns the QualifiedResponder if available (legacy path), otherwise undefined

#### Returns

`undefined` \| [`QualifiedWallet`](../interfaces/QualifiedWallet.md)

***

### hasProvider()

> **hasProvider**(`chainType`): `boolean`

Check if a provider is available for a chain type

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

Type of blockchain to check

#### Returns

`boolean`

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`hasProvider`](AbstractWalletAdapter.md#hasprovider)

***

### install()

> **install**(`context`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Initialize the adapter with context

Called by the framework when the adapter is registered. This method sets up
the adapter's logger, debug mode, and **automatically attempts to restore any
previously persisted session from the Zustand store** to enable auto-reconnect
across page refreshes.

Subclasses can override to perform additional initialization but **must call
super.install()** to ensure proper session restoration.

**Session Restoration**: This method calls [restoreSession](AbstractWalletAdapter.md#restoresession) which loads
session data from the Zustand store and populates [persistedSession](AbstractWalletAdapter.md#persistedsession).
Subclasses can then check this field in their `connect()` method to implement
automatic reconnection logic.

#### Parameters

##### context

[`AdapterContext`](../interfaces/AdapterContext.md)

Adapter context with logger and configuration

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### See

 - [restoreSession](AbstractWalletAdapter.md#restoresession) for session restoration details
 - [persistedSession](AbstractWalletAdapter.md#persistedsession) for accessing restored session data

#### Example

```typescript
async install(context: AdapterContext): Promise<void> {
  // Always call super first to restore session
  await super.install(context);

  // Additional initialization
  this.initializeCustomFeatures();

  // Optionally check for persisted session
  const session = this.getPersistedSession();
  if (session) {
    this.log('info', 'Found previous session, auto-reconnect available');
  }
}
```

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`install`](AbstractWalletAdapter.md#install)

***

### log()

> `protected` **log**(`level`, `message`, `data?`): `void`

Log message with optional data

#### Parameters

##### level

`"error"` | `"debug"` | `"info"` | `"warn"`

##### message

`string`

##### data?

`unknown`

#### Returns

`void`

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`log`](AbstractWalletAdapter.md#log)

***

### off()

> **off**\<`E`\>(`event`, `handler`): `void`

Unsubscribe from an event

#### Type Parameters

##### E

`E` *extends* keyof [`AdapterEvents`](../type-aliases/AdapterEvents.md)

#### Parameters

##### event

`E`

##### handler

[`EventHandler`](../../../internal/types/typedocExports/type-aliases/EventHandler.md)\<`E`\>

#### Returns

`void`

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`off`](AbstractWalletAdapter.md#off)

***

### on()

> **on**\<`E`\>(`event`, `handler`): [`Unsubscribe`](../../../internal/types/typedocExports/type-aliases/Unsubscribe.md)

Subscribe to adapter events

#### Type Parameters

##### E

`E` *extends* keyof [`AdapterEvents`](../type-aliases/AdapterEvents.md)

#### Parameters

##### event

`E`

##### handler

[`EventHandler`](../../../internal/types/typedocExports/type-aliases/EventHandler.md)\<`E`\>

#### Returns

[`Unsubscribe`](../../../internal/types/typedocExports/type-aliases/Unsubscribe.md)

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`on`](AbstractWalletAdapter.md#on)

***

### once()

> **once**\<`E`\>(`event`, `handler`): [`Unsubscribe`](../../../internal/types/typedocExports/type-aliases/Unsubscribe.md)

Subscribe to a one-time event

#### Type Parameters

##### E

`E` *extends* keyof [`AdapterEvents`](../type-aliases/AdapterEvents.md)

#### Parameters

##### event

`E`

##### handler

[`EventHandler`](../../../internal/types/typedocExports/type-aliases/EventHandler.md)\<`E`\>

#### Returns

[`Unsubscribe`](../../../internal/types/typedocExports/type-aliases/Unsubscribe.md)

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`once`](AbstractWalletAdapter.md#once)

***

### persistSession()

> `protected` **persistSession**(`connection`, `sessionId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Override persistSession to save DiscoveryAdapter-specific data

#### Parameters

##### connection

[`WalletConnection`](../interfaces/WalletConnection.md)

##### sessionId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Overrides

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`persistSession`](AbstractWalletAdapter.md#persistsession)

***

### restoreSession()

> `protected` **restoreSession**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Restore a previously persisted session from Zustand store

This method is automatically called by `install()` during adapter initialization.
It searches the Zustand store for a SessionState matching this wallet's ID and,
if found, caches it in the [persistedSession](AbstractWalletAdapter.md#persistedsession) field for potential use
during reconnection flows.

**Important**: This method only **loads** session data; it does **not** automatically
reconnect to the wallet. Subclasses should override this method (calling `super.restoreSession()`)
to implement wallet-specific reconnection logic.

**Architecture**: Prior to the Zustand migration (2025-01), this method used
WalletStorage to load AdapterSessionData. Now it loads the full SessionState from
the Zustand store, providing richer context including account information, chain
details, and permissions.

**Lifecycle**:
1. `install()` calls this method
2. Method queries Zustand store for sessions matching `this.id`
3. If found, stores in `this.persistedSession`
4. Updates session's `lastActiveAt` timestamp
5. Subclass `connect()` can check `this.persistedSession` for auto-reconnect

**Override Pattern**:
```typescript
protected async restoreSession(): Promise<void> {
  // Call parent to load session data
  await super.restoreSession();

  // Check if we have a session to restore
  const session = this.getPersistedSession();
  if (!session) return;

  // Implement wallet-specific reconnection
  try {
    await this.reconnectWithSession(session);
    this.log('info', 'Auto-reconnected from persisted session');
  } catch (error) {
    this.log('warn', 'Auto-reconnect failed, user must reconnect manually', error);
  }
}
```

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### See

 - [install](AbstractWalletAdapter.md#install) which calls this method automatically
 - [persistedSession](AbstractWalletAdapter.md#persistedsession) which stores the loaded session
 - [persistSession](AbstractWalletAdapter.md#persistsession) for how session data is saved
 - [getPersistedSession](AbstractWalletAdapter.md#getpersistedsession) for accessing the restored session

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`restoreSession`](AbstractWalletAdapter.md#restoresession)

***

### setupProviderListeners()

> `protected` **setupProviderListeners**(`provider`): `void`

Set up provider event listeners to forward events to adapter

#### Parameters

##### provider

`unknown`

#### Returns

`void`

#### Overrides

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`setupProviderListeners`](AbstractWalletAdapter.md#setupproviderlisteners)

***

### supportsChain()

> **supportsChain**(`chainType`): `boolean`

Check if this adapter supports a specific chain

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

#### Returns

`boolean`

***

### uninstall()

> **uninstall**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Clean up adapter resources

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`uninstall`](AbstractWalletAdapter.md#uninstall)

***

### extractAdapterData()

> `static` **extractAdapterData**(`qualifiedResponder`): `DiscoveryAdapterData`

Extract minimal adapter data from a QualifiedResponder

This static method extracts only the essential information needed to
construct a DiscoveryAdapter, without requiring the full QualifiedResponder
object. This enables adapter persistence and recreation after page refresh.

#### Parameters

##### qualifiedResponder

`unknown`

The discovery protocol response

#### Returns

`DiscoveryAdapterData`

Minimal data required to construct the adapter

***

### getWalletInfoFromResponder()

> `static` **getWalletInfoFromResponder**(`responder`): `object`

Extract wallet information from a QualifiedResponder
Useful for displaying discovered wallets without instantiating the adapter

#### Parameters

##### responder

[`QualifiedWallet`](../interfaces/QualifiedWallet.md)

The qualified responder from discovery protocol

#### Returns

`object`

Wallet metadata and capabilities

##### chains

> **chains**: [`ChainType`](../enumerations/ChainType.md)[]

##### features

> **features**: [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)\<[`WalletFeature`](../type-aliases/WalletFeature.md)\>

##### icon

> **icon**: `string`

##### id

> **id**: `string`

##### name

> **name**: `string`

##### rdns

> **rdns**: `string`

##### transportType

> **transportType**: `string`
