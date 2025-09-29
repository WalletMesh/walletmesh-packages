[**@walletmesh/modal-core v0.0.1**](../../../README.md)

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

### providers

> `protected` **providers**: [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)\<[`ChainType`](../enumerations/ChainType.md), [`WalletProvider`](../../../internal/types/typedocExports/type-aliases/WalletProvider.md)\>

Active provider instances by chain type

***

### storage

> `protected` **storage**: `null` \| `WalletStorage` = `null`

Storage instance for session persistence

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

### connection

#### Get Signature

> **get** **connection**(): `null` \| [`WalletConnection`](../interfaces/WalletConnection.md)

Get current connection (read-only)

##### Returns

`null` \| [`WalletConnection`](../interfaces/WalletConnection.md)

Current connection if connected

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`connection`](../interfaces/WalletAdapter.md#connection)

***

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
Called automatically on disconnect and uninstall

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

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

`"disconnected"` | `"accountsChanged"` | `"chainChanged"`

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

> `protected` **getPersistedSession**(): `undefined` \| `AdapterSessionData`

Get the persisted session data if available

#### Returns

`undefined` \| `AdapterSessionData`

The persisted session data or undefined

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

***

### restoreSession()

> `protected` **restoreSession**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Restore a previously persisted session

This method attempts to restore a session from storage but does not
automatically reconnect. Subclasses should override this method to
implement reconnection logic specific to their wallet type.

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

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
