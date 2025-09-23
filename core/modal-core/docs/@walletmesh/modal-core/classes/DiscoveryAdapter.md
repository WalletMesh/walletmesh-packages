[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DiscoveryAdapter

# Class: DiscoveryAdapter

Generic adapter that automatically configures transports and providers
based on discovered wallet metadata. Supports all chain types.

## Extends

- [`AbstractWalletAdapter`](AbstractWalletAdapter.md)

## Constructors

### Constructor

> **new DiscoveryAdapter**(`qualifiedResponder`, `connectionManager`, `config`): `DiscoveryAdapter`

#### Parameters

##### qualifiedResponder

`unknown`

##### connectionManager

[`DiscoveryConnectionManager`](../interfaces/DiscoveryConnectionManager.md)

##### config

[`DiscoveryAdapterConfig`](../interfaces/DiscoveryAdapterConfig.md) = `{}`

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

> `protected` `readonly` **eventEmitter**: `EventEmitter`\<`string` \| `symbol`, `any`\>

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

### providers

> `protected` **providers**: [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)\<[`ChainType`](../enumerations/ChainType.md), [`WalletProvider`](../../../internal/types/typedocExports/type-aliases/WalletProvider.md)\>

Active provider instances by chain type

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`providers`](AbstractWalletAdapter.md#providers)

***

### storage

> `protected` **storage**: `null` \| `WalletStorage` = `null`

Storage instance for session persistence

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`storage`](AbstractWalletAdapter.md#storage)

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

### connection

#### Get Signature

> **get** **connection**(): `null` \| [`WalletConnection`](../interfaces/WalletConnection.md)

Get current connection (read-only)

##### Returns

`null` \| [`WalletConnection`](../interfaces/WalletConnection.md)

Current connection if connected

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`connection`](AbstractWalletAdapter.md#connection)

***

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
Called automatically on disconnect and uninstall

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

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

`"disconnected"` | `"accountsChanged"` | `"chainChanged"`

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

> `protected` **getPersistedSession**(): `undefined` \| `AdapterSessionData`

Get the persisted session data if available

#### Returns

`undefined` \| `AdapterSessionData`

The persisted session data or undefined

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

> **getTransportConfig**(): `undefined` \| `TransportConfig`

Get transport config for debugging

#### Returns

`undefined` \| `TransportConfig`

***

### getWalletMetadata()

> **getWalletMetadata**(): [`QualifiedWallet`](../interfaces/QualifiedWallet.md)

Get the discovered wallet metadata

#### Returns

[`QualifiedWallet`](../interfaces/QualifiedWallet.md)

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

Called by the framework when the adapter is registered. Subclasses can
override to perform additional initialization but should call super.install().

#### Parameters

##### context

[`AdapterContext`](../interfaces/AdapterContext.md)

Adapter context with logger and configuration

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Example

```typescript
async install(context: AdapterContext): Promise<void> {
  await super.install(context);
  // Additional initialization
  this.initializeCustomFeatures();
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

Persist session data to storage for recovery across page refreshes

#### Parameters

##### connection

[`WalletConnection`](../interfaces/WalletConnection.md)

The wallet connection to persist

##### sessionId

`string`

The session ID to use

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`persistSession`](AbstractWalletAdapter.md#persistsession)

***

### restoreSession()

> `protected` **restoreSession**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Restore a previously persisted session

This method attempts to restore a session from storage but does not
automatically reconnect. Subclasses should override this method to
implement reconnection logic specific to their wallet type.

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Inherited from

[`AbstractWalletAdapter`](AbstractWalletAdapter.md).[`restoreSession`](AbstractWalletAdapter.md#restoresession)

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

#### Inherited from

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
