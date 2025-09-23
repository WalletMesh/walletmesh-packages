[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletAdapter

# Interface: WalletAdapter

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:176

Main wallet adapter interface
Implementations of this interface provide wallet-specific functionality

## Properties

### capabilities

> `readonly` **capabilities**: [`WalletCapabilities`](WalletCapabilities.md)

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:182

Capabilities and requirements of this wallet

***

### connection

> `readonly` **connection**: `null` \| [`WalletConnection`](WalletConnection.md)

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:208

Current connection if connected

***

### id

> `readonly` **id**: `string`

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:178

Unique identifier for this wallet

***

### metadata

> `readonly` **metadata**: [`WalletAdapterMetadata`](WalletAdapterMetadata.md)

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:180

Display metadata for the wallet

***

### state

> `readonly` **state**: [`WalletAdapterConnectionState`](WalletAdapterConnectionState.md)

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:206

Current connection state

***

### supportedProviders

> `readonly` **supportedProviders**: `Partial`\<`Record`\<[`ChainType`](../enumerations/ChainType.md), `ProviderClass`\>\>

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:195

Map of supported chain types to provider classes
Used by modal-core client to instantiate the appropriate provider

#### Example

```typescript
supportedProviders: {
  [ChainType.Evm]: EvmProvider,
  [ChainType.Solana]: SolanaProvider
}
```

## Methods

### connect()

> **connect**(`options?`): `Promise`\<[`WalletConnection`](WalletConnection.md)\>

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:215

Connect to the wallet

#### Parameters

##### options?

`ConnectOptions`

Connection options

#### Returns

`Promise`\<[`WalletConnection`](WalletConnection.md)\>

Connection object

#### Throws

If connection fails

***

### detect()

> **detect**(): `Promise`\<[`DetectionResult`](DetectionResult.md)\>

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:256

Detect if wallet is available/installed

#### Returns

`Promise`\<[`DetectionResult`](DetectionResult.md)\>

Detection result with installation status and metadata

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:219

Disconnect from the wallet

#### Returns

`Promise`\<`void`\>

***

### getJSONRPCTransport()?

> `optional` **getJSONRPCTransport**(`chainType`): `undefined` \| `JSONRPCTransport`

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:264

Get JSON-RPC transport for provider communication
Called by modal-core client after connection is established

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

The chain type to get transport for

#### Returns

`undefined` \| `JSONRPCTransport`

JSON-RPC transport instance or undefined if not supported

***

### getProvider()

> **getProvider**(`chainType`): `WalletProvider`

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:226

Get a typed provider for a specific chain type

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

Type of blockchain

#### Returns

`WalletProvider`

Typed provider instance

#### Throws

If chain type not supported or not connected

***

### hasProvider()

> **hasProvider**(`chainType`): `boolean`

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:231

Check if a provider is available for a chain type

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

Type of blockchain to check

#### Returns

`boolean`

***

### install()

> **install**(`context`): `Promise`\<`void`\>

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:200

Initialize the adapter when registered

#### Parameters

##### context

[`AdapterContext`](AdapterContext.md)

Adapter context with logger and app metadata

#### Returns

`Promise`\<`void`\>

***

### off()

> **off**\<`E`\>(`event`, `handler`): `void`

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:251

Unsubscribe from an event

#### Type Parameters

##### E

`E` *extends* keyof [`AdapterEvents`](../type-aliases/AdapterEvents.md)

#### Parameters

##### event

`E`

Event name

##### handler

`EventHandler`\<`E`\>

Event handler function to remove

#### Returns

`void`

***

### on()

> **on**\<`E`\>(`event`, `handler`): `Unsubscribe`

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:238

Subscribe to adapter events

#### Type Parameters

##### E

`E` *extends* keyof [`AdapterEvents`](../type-aliases/AdapterEvents.md)

#### Parameters

##### event

`E`

Event name

##### handler

`EventHandler`\<`E`\>

Event handler function

#### Returns

`Unsubscribe`

Unsubscribe function

***

### once()

> **once**\<`E`\>(`event`, `handler`): `Unsubscribe`

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:245

Subscribe to a one-time event

#### Type Parameters

##### E

`E` *extends* keyof [`AdapterEvents`](../type-aliases/AdapterEvents.md)

#### Parameters

##### event

`E`

Event name

##### handler

`EventHandler`\<`E`\>

Event handler function

#### Returns

`Unsubscribe`

Unsubscribe function

***

### uninstall()

> **uninstall**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:204

Cleanup when adapter is unregistered

#### Returns

`Promise`\<`void`\>
