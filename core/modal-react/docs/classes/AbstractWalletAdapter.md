[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AbstractWalletAdapter

# Abstract Class: AbstractWalletAdapter

Defined in: core/modal-core/dist/internal/wallets/base/AbstractWalletAdapter.d.ts:119

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

Defined in: core/modal-core/dist/internal/wallets/base/AbstractWalletAdapter.d.ts:122

Capabilities and requirements of this wallet

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`capabilities`](../interfaces/WalletAdapter.md#capabilities)

***

### id

> `abstract` `readonly` **id**: `string`

Defined in: core/modal-core/dist/internal/wallets/base/AbstractWalletAdapter.d.ts:120

Unique identifier for this wallet

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`id`](../interfaces/WalletAdapter.md#id)

***

### metadata

> `abstract` `readonly` **metadata**: [`WalletAdapterMetadata`](../interfaces/WalletAdapterMetadata.md)

Defined in: core/modal-core/dist/internal/wallets/base/AbstractWalletAdapter.d.ts:121

Display metadata for the wallet

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`metadata`](../interfaces/WalletAdapter.md#metadata)

***

### supportedProviders

> `readonly` **supportedProviders**: `Partial`\<`Record`\<[`ChainType`](../enumerations/ChainType.md), `ProviderClass`\>\>

Defined in: core/modal-core/dist/internal/wallets/base/AbstractWalletAdapter.d.ts:127

Default supported providers - empty by default
Override in subclasses to specify supported provider classes

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`supportedProviders`](../interfaces/WalletAdapter.md#supportedproviders)

## Accessors

### state

#### Get Signature

> **get** **state**(): [`WalletAdapterConnectionState`](../interfaces/WalletAdapterConnectionState.md)

Defined in: core/modal-core/dist/internal/wallets/base/AbstractWalletAdapter.d.ts:182

Get current connection state (read-only)

##### Returns

[`WalletAdapterConnectionState`](../interfaces/WalletAdapterConnectionState.md)

Current connection state

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`state`](../interfaces/WalletAdapter.md#state)

## Methods

### connect()

> `abstract` **connect**(`options?`): `Promise`\<[`WalletConnection`](../interfaces/WalletConnection.md)\>

Defined in: core/modal-core/dist/internal/wallets/base/AbstractWalletAdapter.d.ts:230

Connect to the wallet

#### Parameters

##### options?

`ConnectOptions`

Connection options

#### Returns

`Promise`\<[`WalletConnection`](../interfaces/WalletConnection.md)\>

Connection object

#### Throws

If connection fails

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`connect`](../interfaces/WalletAdapter.md#connect)

***

### detect()

> `abstract` **detect**(): `Promise`\<[`DetectionResult`](../interfaces/DetectionResult.md)\>

Defined in: core/modal-core/dist/internal/wallets/base/AbstractWalletAdapter.d.ts:229

Abstract methods that subclasses must implement

#### Returns

`Promise`\<[`DetectionResult`](../interfaces/DetectionResult.md)\>

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`detect`](../interfaces/WalletAdapter.md#detect)

***

### disconnect()

> `abstract` **disconnect**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/internal/wallets/base/AbstractWalletAdapter.d.ts:231

Disconnect from the wallet

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`disconnect`](../interfaces/WalletAdapter.md#disconnect)

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

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`getJSONRPCTransport`](../interfaces/WalletAdapter.md#getjsonrpctransport)

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

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`getProvider`](../interfaces/WalletAdapter.md#getprovider)

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

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`hasProvider`](../interfaces/WalletAdapter.md#hasprovider)

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

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`install`](../interfaces/WalletAdapter.md#install)

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

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`off`](../interfaces/WalletAdapter.md#off)

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

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`on`](../interfaces/WalletAdapter.md#on)

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

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`once`](../interfaces/WalletAdapter.md#once)

***

### uninstall()

> **uninstall**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/internal/wallets/base/AbstractWalletAdapter.d.ts:225

Clean up adapter resources

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`WalletAdapter`](../interfaces/WalletAdapter.md).[`uninstall`](../interfaces/WalletAdapter.md#uninstall)
