[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / DebugWallet

# Class: DebugWallet

Defined in: core/modal-core/dist/internal/wallets/debug/DebugWallet.d.ts:46

Debug wallet adapter for testing and development

Features:
- Supports all chain types (EVM, Aztec, Solana)
- Provides mock implementations for all methods
- Configurable behavior for testing scenarios
- No external blockchain library dependencies

## Extends

- [`AbstractWalletAdapter`](AbstractWalletAdapter.md)

## Constructors

### Constructor

> **new DebugWallet**(`config?`): `DebugWallet`

Defined in: core/modal-core/dist/internal/wallets/debug/DebugWallet.d.ts:56

#### Parameters

##### config?

[`DebugWalletConfig`](../interfaces/DebugWalletConfig.md)

#### Returns

`DebugWallet`

#### Overrides

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`constructor`](AbstractWalletAdapter.md#constructor)

## Properties

### capabilities

> `readonly` **capabilities**: [`WalletCapabilities`](../interfaces/WalletCapabilities.md)

Defined in: core/modal-core/dist/internal/wallets/debug/DebugWallet.d.ts:49

Capabilities and requirements of this wallet

#### Overrides

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`capabilities`](AbstractWalletAdapter.md#capabilities)

***

### id

> `readonly` **id**: `"debug-wallet"` = `"debug-wallet"`

Defined in: core/modal-core/dist/internal/wallets/debug/DebugWallet.d.ts:47

Unique identifier for this wallet

#### Overrides

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`id`](AbstractWalletAdapter.md#id)

***

### metadata

> `readonly` **metadata**: [`WalletAdapterMetadata`](../interfaces/WalletAdapterMetadata.md)

Defined in: core/modal-core/dist/internal/wallets/debug/DebugWallet.d.ts:48

Display metadata for the wallet

#### Overrides

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`metadata`](AbstractWalletAdapter.md#metadata)

***

### supportedProviders

> `readonly` **supportedProviders**: `Partial`\<`Record`\<[`ChainType`](../enumerations/ChainType.md), `ProviderClass`\>\>

Defined in: core/modal-core/dist/internal/wallets/base/AbstractWalletAdapter.d.ts:127

Default supported providers - empty by default
Override in subclasses to specify supported provider classes

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`supportedProviders`](AbstractWalletAdapter.md#supportedproviders)

## Accessors

### state

#### Get Signature

> **get** **state**(): [`WalletAdapterConnectionState`](../interfaces/WalletAdapterConnectionState.md)

Defined in: core/modal-core/dist/internal/wallets/base/AbstractWalletAdapter.d.ts:182

Get current connection state (read-only)

##### Returns

[`WalletAdapterConnectionState`](../interfaces/WalletAdapterConnectionState.md)

Current connection state

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`state`](AbstractWalletAdapter.md#state)

## Methods

### connect()

> **connect**(`options?`): `Promise`\<[`WalletConnection`](../interfaces/WalletConnection.md)\>

Defined in: core/modal-core/dist/internal/wallets/debug/DebugWallet.d.ts:60

Public connect method required by AbstractWalletAdapter

#### Parameters

##### options?

`ConnectOptions`

#### Returns

`Promise`\<[`WalletConnection`](../interfaces/WalletConnection.md)\>

#### Overrides

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`connect`](AbstractWalletAdapter.md#connect)

***

### detect()

> **detect**(): `Promise`\<[`DetectionResult`](../interfaces/DetectionResult.md)\>

Defined in: core/modal-core/dist/internal/wallets/debug/DebugWallet.d.ts:91

Detect wallet availability

#### Returns

`Promise`\<[`DetectionResult`](../interfaces/DetectionResult.md)\>

#### Overrides

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`detect`](AbstractWalletAdapter.md#detect)

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/internal/wallets/debug/DebugWallet.d.ts:64

Public disconnect method required by AbstractWalletAdapter

#### Returns

`Promise`\<`void`\>

#### Overrides

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`disconnect`](AbstractWalletAdapter.md#disconnect)

***

### getJSONRPCTransport()?

> `optional` **getJSONRPCTransport**(`_chainType`): `undefined` \| `JSONRPCTransport`

Defined in: core/modal-core/dist/internal/wallets/base/AbstractWalletAdapter.d.ts:256

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

### getMockProvider()

> **getMockProvider**(`chainType?`, `accounts?`, `chainId?`): `WalletProvider`

Defined in: core/modal-core/dist/internal/wallets/debug/DebugWallet.d.ts:74

Get mock provider for testing
Returns a comprehensive mock that implements common wallet provider methods

#### Parameters

##### chainType?

[`ChainType`](../enumerations/ChainType.md)

##### accounts?

`string`[]

##### chainId?

`string`

#### Returns

`WalletProvider`

***

### getProvider()

> **getProvider**(`chainType`): `WalletProvider`

Defined in: core/modal-core/dist/internal/wallets/base/AbstractWalletAdapter.d.ts:263

Get provider for a specific chain type

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

Type of blockchain

#### Returns

`WalletProvider`

Provider instance

#### Throws

If chain type not supported or not connected

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`getProvider`](AbstractWalletAdapter.md#getprovider)

***

### hasProvider()

> **hasProvider**(`chainType`): `boolean`

Defined in: core/modal-core/dist/internal/wallets/base/AbstractWalletAdapter.d.ts:268

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

> **install**(`context`): `Promise`\<`void`\>

Defined in: core/modal-core/dist/internal/wallets/base/AbstractWalletAdapter.d.ts:221

Initialize the adapter with context

Called by the framework when the adapter is registered. This method sets up
the adapter's logger, debug mode, and **automatically attempts to restore any
previously persisted session from the Zustand store** to enable auto-reconnect
across page refreshes.

Subclasses can override to perform additional initialization but **must call
super.install()** to ensure proper session restoration.

**Session Restoration**: This method calls restoreSession which loads
session data from the Zustand store and populates persistedSession.
Subclasses can then check this field in their `connect()` method to implement
automatic reconnection logic.

#### Parameters

##### context

[`AdapterContext`](../interfaces/AdapterContext.md)

Adapter context with logger and configuration

#### Returns

`Promise`\<`void`\>

#### See

 - restoreSession for session restoration details
 - persistedSession for accessing restored session data

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

### off()

> **off**\<`E`\>(`event`, `handler`): `void`

Defined in: core/modal-core/dist/internal/wallets/base/AbstractWalletAdapter.d.ts:248

Unsubscribe from an event

#### Type Parameters

##### E

`E` *extends* keyof [`AdapterEvents`](../type-aliases/AdapterEvents.md)

#### Parameters

##### event

`E`

##### handler

`EventHandler`\<`E`\>

#### Returns

`void`

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`off`](AbstractWalletAdapter.md#off)

***

### on()

> **on**\<`E`\>(`event`, `handler`): `Unsubscribe`

Defined in: core/modal-core/dist/internal/wallets/base/AbstractWalletAdapter.d.ts:240

Subscribe to adapter events

#### Type Parameters

##### E

`E` *extends* keyof [`AdapterEvents`](../type-aliases/AdapterEvents.md)

#### Parameters

##### event

`E`

##### handler

`EventHandler`\<`E`\>

#### Returns

`Unsubscribe`

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`on`](AbstractWalletAdapter.md#on)

***

### once()

> **once**\<`E`\>(`event`, `handler`): `Unsubscribe`

Defined in: core/modal-core/dist/internal/wallets/base/AbstractWalletAdapter.d.ts:244

Subscribe to a one-time event

#### Type Parameters

##### E

`E` *extends* keyof [`AdapterEvents`](../type-aliases/AdapterEvents.md)

#### Parameters

##### event

`E`

##### handler

`EventHandler`\<`E`\>

#### Returns

`Unsubscribe`

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`once`](AbstractWalletAdapter.md#once)

***

### uninstall()

> **uninstall**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/internal/wallets/base/AbstractWalletAdapter.d.ts:225

Clean up adapter resources

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`uninstall`](AbstractWalletAdapter.md#uninstall)

***

### getWalletInfo()

> `static` **getWalletInfo**(): [`WalletInfo`](../interfaces/WalletInfo.md)

Defined in: core/modal-core/dist/internal/wallets/debug/DebugWallet.d.ts:95

Get wallet info

#### Returns

[`WalletInfo`](../interfaces/WalletInfo.md)
