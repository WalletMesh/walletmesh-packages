[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / AbstractWalletAdapter

# Abstract Class: AbstractWalletAdapter

Base Wallet Adapter - Foundation for wallet connection implementations

PURPOSE: Adapters are CONNECTION LAYER components that handle HOW to connect to specific wallets.
They manage the transport establishment, connection protocols, and wallet-specific communication.

ARCHITECTURAL SEPARATION:
- Adapters: Handle wallet connection (this class)
- Providers: Handle blockchain API (created by adapters after connection)

This base class provides infrastructure that reduces adapter implementation complexity by handling:
- Wallet detection and availability checks
- Transport lifecycle (popup windows, extensions, mobile connections)
- Provider instantiation with established transport
- Connection state management and persistence
- Event coordination between wallet and dApp
- Resource cleanup and memory management

## Example

```typescript
// Implementing a wallet adapter (connection layer)
export class MyWalletAdapter extends AbstractWalletAdapter {
  readonly id = 'mywallet';

  readonly metadata = {
    name: 'My Wallet',
    icon: 'https://...',
    description: 'My custom wallet'
  };

  readonly capabilities = {
    chains: [{ type: ChainType.Evm, id: '1' }],
    features: ['sign-message', 'sign-transaction'],
  };

  async connect(options?: ConnectOptions): Promise<WalletConnection> {
    // 1. Establish transport (wallet-specific connection)
    const transport = await this.createTransport('popup', {
      url: 'https://wallet.example.com'
    });

    // 2. Create provider with transport (blockchain API)
    const provider = await this.createProvider(
      EvmProvider,  // Provider handles blockchain operations
      transport,    // Transport from step 1
      ChainType.Evm,
      chainId
    );

    // 3. Return connection with provider for dApp use
    return this.createConnection({
      address: accounts[0],
      accounts,
      chainId,
      chainType: ChainType.Evm,
      provider  // dApp will use this for blockchain operations
    });
  }
}
```

## Remarks

- Adapters know HOW to connect to wallets (transport, protocol, discovery)
- Providers know HOW to interact with blockchains (transactions, signing, queries)
- Adapters create providers after establishing connection
- This separation enables code reuse and standards compliance

## See

ADAPTER_PROVIDER_ARCHITECTURE.md for architecture details

## Extended by

- [`DiscoveryAdapter`](DiscoveryAdapter.md)
- [`DebugWallet`](DebugWallet.md)

## Implements

- [`WalletAdapter`](../interfaces/WalletAdapter.md)

## Constructors

### Constructor

> **new AbstractWalletAdapter**(): `AbstractWalletAdapter`

#### Returns

`AbstractWalletAdapter`

## Properties

### capabilities

> `abstract` `readonly` **capabilities**: [`WalletCapabilities`](../interfaces/WalletCapabilities.md)

Capabilities and requirements of this wallet

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`capabilities`](../interfaces/WalletAdapter.md#capabilities)

***

### debug

> `protected` **debug**: `boolean` = `false`

Debug mode

***

### eventEmitter

> `protected` `readonly` **eventEmitter**: [`EventEmitter`](../../../internal/types/typedocExports/classes/EventEmitter.md)

Event emitter for adapter events

***

### id

> `abstract` `readonly` **id**: `string`

Unique identifier for this wallet

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`id`](../interfaces/WalletAdapter.md#id)

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

***

### metadata

> `abstract` `readonly` **metadata**: [`WalletAdapterMetadata`](../interfaces/WalletAdapterMetadata.md)

Display metadata for the wallet

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`metadata`](../interfaces/WalletAdapter.md#metadata)

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

 - [restoreSession](#restoresession) for how this field is populated
 - [persistSession](#persistsession) for how session data is saved to the store
 - [getPersistedSession](#getpersistedsession) for accessing this field

***

### providers

> `protected` **providers**: [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)\<[`ChainType`](../enumerations/ChainType.md), [`WalletProvider`](../../../internal/types/typedocExports/type-aliases/WalletProvider.md)\>

Active provider instances by chain type

***

### supportedProviders

> `readonly` **supportedProviders**: `Partial`\<`Record`\<[`ChainType`](../enumerations/ChainType.md), [`ProviderClass`](../type-aliases/ProviderClass.md)\>\> = `{}`

Default supported providers - empty by default
Override in subclasses to specify supported provider classes

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`supportedProviders`](../interfaces/WalletAdapter.md#supportedproviders)

***

### transport

> `protected` **transport**: `null` \| [`Transport`](../interfaces/Transport.md) = `null`

Active transport instance

## Accessors

### state

#### Get Signature

> **get** **state**(): [`WalletAdapterConnectionState`](../interfaces/WalletAdapterConnectionState.md)

Get current connection state (read-only)

##### Returns

[`WalletAdapterConnectionState`](../interfaces/WalletAdapterConnectionState.md)

Current connection state

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`state`](../interfaces/WalletAdapter.md#state)

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
 - [persistSession](#persistsession) for how sessions are saved

***

### connect()

> `abstract` **connect**(`options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletConnection`](../interfaces/WalletConnection.md)\>

Connect to the wallet

#### Parameters

##### options?

[`ConnectOptions`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md)

Connection options

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletConnection`](../interfaces/WalletConnection.md)\>

Connection object

#### Throws

If connection fails

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`connect`](../interfaces/WalletAdapter.md#connect)

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

***

### detect()

> `abstract` **detect**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`DetectionResult`](../interfaces/DetectionResult.md)\>

Abstract methods that subclasses must implement

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`DetectionResult`](../interfaces/DetectionResult.md)\>

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`detect`](../interfaces/WalletAdapter.md#detect)

***

### disconnect()

> `abstract` **disconnect**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Disconnect from the wallet

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`disconnect`](../interfaces/WalletAdapter.md#disconnect)

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

***

### generateSessionId()

> `protected` **generateSessionId**(): `string`

Generate a unique session ID for wallet connections

#### Returns

`string`

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

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`getJSONRPCTransport`](../interfaces/WalletAdapter.md#getjsonrpctransport)

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

 - [restoreSession](#restoresession) for how this field is populated
 - [persistedSession](#persistedsession) for the internal storage field

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

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`getProvider`](../interfaces/WalletAdapter.md#getprovider)

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

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`hasProvider`](../interfaces/WalletAdapter.md#hasprovider)

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

**Session Restoration**: This method calls [restoreSession](#restoresession) which loads
session data from the Zustand store and populates [persistedSession](#persistedsession).
Subclasses can then check this field in their `connect()` method to implement
automatic reconnection logic.

#### Parameters

##### context

[`AdapterContext`](../interfaces/AdapterContext.md)

Adapter context with logger and configuration

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### See

 - [restoreSession](#restoresession) for session restoration details
 - [persistedSession](#persistedsession) for accessing restored session data

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

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`install`](../interfaces/WalletAdapter.md#install)

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

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`off`](../interfaces/WalletAdapter.md#off)

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

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`on`](../interfaces/WalletAdapter.md#on)

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

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`once`](../interfaces/WalletAdapter.md#once)

***

### persistSession()

> `protected` **persistSession**(`connection`, `sessionId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Persist session adapter reconstruction data to Zustand store for recovery across page refreshes

This method stores the minimal data needed to recreate the adapter and transport
after a page refresh. The data is saved to the SessionState's `adapterReconstruction`
field in the Zustand store, which is automatically persisted to localStorage.

**Architecture**: Prior to the Zustand migration (2025-01), this method used
WalletStorage with a separate AdapterSessionData interface. Now it integrates
directly with the unified SessionState in the Zustand store.

**What Gets Persisted**:
- `adapterType`: Wallet adapter identifier (e.g., 'metamask', 'phantom')
- `blockchainType`: Chain type (e.g., 'evm', 'solana', 'aztec')
- `transportConfig`: Transport type and configuration for reconnection
- `walletMetadata`: Wallet name, icon, and description for UI display
- `sessionId`: Session identifier for RPC calls

**Page Refresh Flow**:
1. User connects wallet → Session created in Zustand store
2. `persistSession()` called → Updates SessionState.adapterReconstruction
3. Zustand persist middleware → Saves to localStorage
4. Page refresh → Zustand rehydrates from localStorage
5. `restoreSession()` called → Loads SessionState with adapterReconstruction
6. Adapter can use this data to reconnect automatically

#### Parameters

##### connection

[`WalletConnection`](../interfaces/WalletConnection.md)

The wallet connection containing data to persist

##### sessionId

`string`

The session ID for this connection

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### See

 - [restoreSession](#restoresession) for how this data is loaded after page refresh
 - [SessionState.adapterReconstruction](../interfaces/SessionState.md#adapterreconstruction) for the stored data structure
 - [cleanup](#cleanup) for how persisted data is cleared on disconnect

#### Example

```typescript
// After successful wallet connection
const connection = await this.doConnect(options);
const sessionId = this.generateSessionId();

// Persist for page refresh recovery
await this.persistSession(connection, sessionId);

// Stored structure (automatically saved to localStorage):
// {
//   adapterType: 'metamask',
//   blockchainType: 'evm',
//   transportConfig: { type: 'extension', config: {} },
//   walletMetadata: {
//     name: 'MetaMask',
//     icon: 'data:image/svg+xml;base64,...',
//     description: 'MetaMask browser extension'
//   },
//   sessionId: 'session_metamask_abc123'
// }
```

***

### restoreSession()

> `protected` **restoreSession**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Restore a previously persisted session from Zustand store

This method is automatically called by `install()` during adapter initialization.
It searches the Zustand store for a SessionState matching this wallet's ID and,
if found, caches it in the [persistedSession](#persistedsession) field for potential use
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

 - [install](#install) which calls this method automatically
 - [persistedSession](#persistedsession) which stores the loaded session
 - [persistSession](#persistsession) for how session data is saved
 - [getPersistedSession](#getpersistedsession) for accessing the restored session

***

### setupProviderListeners()?

> `protected` `optional` **setupProviderListeners**(`provider`): `void`

Optional: Override to set up provider event listeners
This is called automatically after provider creation

#### Parameters

##### provider

[`WalletProvider`](../../../internal/types/typedocExports/type-aliases/WalletProvider.md)

#### Returns

`void`

***

### uninstall()

> **uninstall**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Clean up adapter resources

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`uninstall`](../interfaces/WalletAdapter.md#uninstall)
