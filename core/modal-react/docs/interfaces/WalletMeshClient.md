[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshClient

# Interface: WalletMeshClient

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:183

Main WalletMeshClient class for comprehensive wallet management

This client provides full-featured wallet connection management with:
- Lazy loading of blockchain providers
- Discovery service integration
- Type-safe connection options
- Event system for wallet and provider events
- State management integration
- Error handling and recovery
- Provider lifecycle management

## Example

```typescript
const client = new WalletMeshClient({
  appName: 'My DApp',
  appDescription: 'A decentralized application',
  chains: [
    { chainId: '1', chainType: 'evm', name: 'Ethereum' }
  ],
  providerLoader: {
    preloadOnInit: true,
    preloadChainTypes: ['evm']
  }
}, registry, modal, logger);

await client.initialize();
const connection = await client.connect('metamask', { chainId: '1' });
```

## Accessors

### isConnected

#### Get Signature

> **get** **isConnected**(): `boolean`

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:314

Whether any wallet is currently connected

##### Returns

`boolean`

True if any wallet is connected

## Methods

### clearTransactionError()

> **clearTransactionError**(): `void`

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:493

Clear transaction error from store

#### Returns

`void`

***

### closeModal()

> **closeModal**(): `void`

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:307

Close the wallet selection modal

#### Returns

`void`

***

### connect()

> **connect**(`walletId?`, `options?`): `Promise`\<[`WalletConnection`](WalletConnection.md)\>

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:219

Connect to a wallet with type-safe options

#### Parameters

##### walletId?

`string`

Optional ID of specific wallet to connect

##### options?

`WalletConnectOptions`

Optional connection options

#### Returns

`Promise`\<[`WalletConnection`](WalletConnection.md)\>

Promise resolving to the wallet connection

#### Throws

If connection fails or is rejected by user

***

### destroy()

> **destroy**(): `void`

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:382

Destroy the client and clean up all resources

#### Returns

`void`

***

### disconnect()

> **disconnect**(`walletId`): `Promise`\<`void`\>

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:227

Disconnect from a specific wallet

#### Parameters

##### walletId

`string`

ID of the wallet to disconnect

#### Returns

`Promise`\<`void`\>

Promise that resolves when disconnected

***

### disconnectAll()

> **disconnectAll**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:234

Disconnect from all connected wallets

#### Returns

`Promise`\<`void`\>

Promise that resolves when all wallets are disconnected

***

### discoverWallets()

> **discoverWallets**(): `Promise`\<[`AvailableWallet`](AvailableWallet.md)[]\>

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:277

Detect all available wallets in the environment

#### Returns

`Promise`\<[`AvailableWallet`](AvailableWallet.md)[]\>

Promise resolving to array of detected wallets

***

### getActions()

> **getActions**(): `Record`\<`string`, `unknown`\>

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:376

Get headless modal actions

#### Returns

`Record`\<`string`, `unknown`\>

Modal actions interface

***

### getActiveWallet()

> **getActiveWallet**(): `null` \| `string`

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:329

Get the currently active wallet ID

#### Returns

`null` \| `string`

The active wallet ID or null if none active

***

### getAllConnections()

> **getAllConnections**(): [`WalletConnection`](WalletConnection.md)[]

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:270

Get all wallet connections with full details

#### Returns

[`WalletConnection`](WalletConnection.md)[]

Array of wallet connection objects

***

### getAllWallets()

> **getAllWallets**(): [`WalletAdapter`](WalletAdapter.md)[]

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:292

Get all registered wallet adapters

#### Returns

[`WalletAdapter`](WalletAdapter.md)[]

Array of all registered wallet adapters

***

### getBalanceService()

> **getBalanceService**(): `BalanceService`

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:425

Get the balance service for balance queries

#### Returns

`BalanceService`

BalanceService instance for balance-related business logic

***

### getChainService()

> **getChainService**(): `ChainService`

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:404

Get the chain service for chain management operations

#### Returns

`ChainService`

ChainService instance for chain-related business logic

***

### getConnection()

> **getConnection**(`walletId`): `undefined` \| [`WalletAdapter`](WalletAdapter.md)

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:256

Get a specific wallet connection

#### Parameters

##### walletId

`string`

ID of the wallet

#### Returns

`undefined` \| [`WalletAdapter`](WalletAdapter.md)

The wallet adapter if connected, undefined otherwise

***

### getConnections()

> **getConnections**(): [`WalletAdapter`](WalletAdapter.md)[]

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:263

Get all connected wallet adapters

#### Returns

[`WalletAdapter`](WalletAdapter.md)[]

Array of connected wallet adapters

***

### getConnectionService()

> **getConnectionService**(): `ConnectionService`

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:411

Get the connection service for connection management operations

#### Returns

`ConnectionService`

ConnectionService instance for connection-related business logic

***

### getCurrentTransaction()

> **getCurrentTransaction**(): `null` \| [`CoreTransactionResult`](CoreTransactionResult.md)

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:472

Get current transaction from store

#### Returns

`null` \| [`CoreTransactionResult`](CoreTransactionResult.md)

Current transaction or null

***

### getMaxConnections()

> **getMaxConnections**(): `number`

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:336

Get the maximum number of concurrent connections

#### Returns

`number`

Maximum connection limit

***

### getPreferenceService()

> **getPreferenceService**(): `ConnectionService`

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:432

Get the preference service for wallet preferences and history

#### Returns

`ConnectionService`

WalletPreferenceService instance for preference-related business logic

***

### getServices()

> **getServices**(): `object`

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:439

Get all services in a single object for convenience

#### Returns

`object`

Object containing all business logic services

##### balance

> **balance**: `BalanceService`

##### chain

> **chain**: `ChainService`

##### connection

> **connection**: `ConnectionService`

##### dappRpc

> **dappRpc**: `DAppRpcService`

##### health

> **health**: `HealthService`

##### preference

> **preference**: `WalletPreferenceService`

##### session

> **session**: `SessionService`

##### transaction

> **transaction**: `TransactionService`

##### ui

> **ui**: `UIService`

***

### getState()

> **getState**(): `HeadlessModalState`

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:343

Get current modal state

#### Returns

`HeadlessModalState`

Current modal state

***

### getTransaction()

> **getTransaction**(`txId`): `undefined` \| [`CoreTransactionResult`](CoreTransactionResult.md)

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:480

Get transaction by ID from store

#### Parameters

##### txId

`string`

Transaction ID

#### Returns

`undefined` \| [`CoreTransactionResult`](CoreTransactionResult.md)

Transaction result or undefined

***

### getTransactionHistory()

> **getTransactionHistory**(): [`CoreTransactionResult`](CoreTransactionResult.md)[]

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:465

Get transaction history from store

#### Returns

[`CoreTransactionResult`](CoreTransactionResult.md)[]

Array of transaction results sorted by start time

***

### getTransactionService()

> **getTransactionService**(): `TransactionService`

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:418

Get the transaction service for transaction operations

#### Returns

`TransactionService`

TransactionService instance for transaction-related business logic

***

### getTransactionStatus()

> **getTransactionStatus**(): [`TransactionStatus`](../type-aliases/TransactionStatus.md)

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:487

Get current transaction status from store

#### Returns

[`TransactionStatus`](../type-aliases/TransactionStatus.md)

Current transaction status

***

### getWallet()

> **getWallet**(`walletId`): `undefined` \| [`WalletAdapter`](WalletAdapter.md)

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:285

Get a specific wallet adapter

#### Parameters

##### walletId

`string`

ID of the wallet

#### Returns

`undefined` \| [`WalletAdapter`](WalletAdapter.md)

The wallet adapter if registered, undefined otherwise

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:209

Initialize the client and all its services

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

***

### on()

> **on**(`event`, `handler`): () => `void`

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:360

Subscribe to events

#### Parameters

##### event

`string`

Event name

##### handler

(`data`) => `void`

Event handler function

#### Returns

Unsubscribe function

> (): `void`

##### Returns

`void`

***

### once()

> **once**(`event`, `handler`): () => `void`

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:369

Subscribe to an event once

#### Parameters

##### event

`string`

Event name

##### handler

(`data`) => `void`

Event handler function

#### Returns

Unsubscribe function

> (): `void`

##### Returns

`void`

***

### openModal()

> **openModal**(`options?`): `Promise`\<`void`\>

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:299

Open the wallet selection modal

#### Parameters

##### options?

###### targetChainType?

[`ChainType`](../enumerations/ChainType.md)

#### Returns

`Promise`\<`void`\>

Promise that resolves when modal is opened

***

### sendTransaction()

> **sendTransaction**\<`T`\>(`request`): `Promise`\<[`CoreTransactionResult`](CoreTransactionResult.md)\>

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:458

Send a transaction through the active wallet

#### Type Parameters

##### T

`T` *extends* [`ChainType`](../enumerations/ChainType.md) = [`ChainType`](../enumerations/ChainType.md)

#### Parameters

##### request

[`TransactionRequest`](../type-aliases/TransactionRequest.md)\<`T`\>

Transaction request parameters

#### Returns

`Promise`\<[`CoreTransactionResult`](CoreTransactionResult.md)\>

Promise resolving to transaction result

#### Throws

If no wallet is connected or transaction fails

***

### setActiveWallet()

> **setActiveWallet**(`walletId`): `void`

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:322

Set the active wallet for operations

#### Parameters

##### walletId

`string`

ID of the wallet to make active

#### Returns

`void`

#### Throws

If wallet is not connected

***

### subscribe()

> **subscribe**(`callback`): () => `void`

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:351

Subscribe to modal state changes

#### Parameters

##### callback

(`state`) => `void`

Function to call when state changes

#### Returns

Unsubscribe function

> (): `void`

##### Returns

`void`

***

### switchChain()

> **switchChain**(`chain`, `walletId?`): `Promise`\<\{ `chain`: \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}; `chainType`: [`ChainType`](../enumerations/ChainType.md); `previousChain`: \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}; `provider`: `unknown`; \}\>

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:243

Switch to a different blockchain network

#### Parameters

##### chain

Chain to switch to

###### chainId

`string`

###### chainType

[`ChainType`](../enumerations/ChainType.md)

###### group?

`string`

###### icon?

`string`

###### interfaces?

`string`[]

###### label?

`string`

###### name

`string`

###### required

`boolean`

##### walletId?

`string`

Optional wallet ID. Uses active wallet if not specified

#### Returns

`Promise`\<\{ `chain`: \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}; `chainType`: [`ChainType`](../enumerations/ChainType.md); `previousChain`: \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}; `provider`: `unknown`; \}\>

Promise resolving to chain switch result
