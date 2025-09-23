[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletMeshClient

# Class: WalletMeshClient

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

## Constructors

### Constructor

> **new WalletMeshClient**(`config`, `registry`, `modal`, `logger`): `WalletMeshClient`

#### Parameters

##### config

[`WalletMeshClientConfig`](../interfaces/WalletMeshClientConfig.md)

##### registry

[`WalletRegistry`](WalletRegistry.md)

##### modal

[`ModalController`](../interfaces/ModalController.md)

##### logger

[`Logger`](Logger.md)

#### Returns

`WalletMeshClient`

## Accessors

### isConnected

#### Get Signature

> **get** **isConnected**(): `boolean`

Whether any wallet is currently connected

##### Returns

`boolean`

True if any wallet is connected

## Methods

### clearTransactionError()

> **clearTransactionError**(): `void`

Clear transaction error from store

#### Returns

`void`

***

### closeModal()

> **closeModal**(): `void`

Close the wallet selection modal

#### Returns

`void`

***

### connect()

> **connect**(`walletId?`, `options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletConnection`](../interfaces/WalletConnection.md)\>

Connect to a wallet with type-safe options

#### Parameters

##### walletId?

`string`

Optional ID of specific wallet to connect

##### options?

[`WalletConnectOptions`](../interfaces/WalletConnectOptions.md)

Optional connection options

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletConnection`](../interfaces/WalletConnection.md)\>

Promise resolving to the wallet connection

#### Throws

If connection fails or is rejected by user

***

### destroy()

> **destroy**(): `void`

Destroy the client and clean up all resources

#### Returns

`void`

***

### disconnect()

> **disconnect**(`walletId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Disconnect from a specific wallet

#### Parameters

##### walletId

`string`

ID of the wallet to disconnect

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when disconnected

***

### disconnectAll()

> **disconnectAll**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Disconnect from all connected wallets

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when all wallets are disconnected

***

### discoverWallets()

> **discoverWallets**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AvailableWallet`](../interfaces/AvailableWallet.md)[]\>

Detect all available wallets in the environment

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AvailableWallet`](../interfaces/AvailableWallet.md)[]\>

Promise resolving to array of detected wallets

***

### getActions()

> **getActions**(): `Record`\<`string`, `unknown`\>

Get headless modal actions

#### Returns

`Record`\<`string`, `unknown`\>

Modal actions interface

***

### getActiveWallet()

> **getActiveWallet**(): `null` \| `string`

Get the currently active wallet ID

#### Returns

`null` \| `string`

The active wallet ID or null if none active

***

### getAllConnections()

> **getAllConnections**(): [`WalletConnection`](../interfaces/WalletConnection.md)[]

Get all wallet connections with full details

#### Returns

[`WalletConnection`](../interfaces/WalletConnection.md)[]

Array of wallet connection objects

***

### getAllWallets()

> **getAllWallets**(): [`WalletAdapter`](../interfaces/WalletAdapter.md)[]

Get all registered wallet adapters

#### Returns

[`WalletAdapter`](../interfaces/WalletAdapter.md)[]

Array of all registered wallet adapters

***

### getBalanceService()

> **getBalanceService**(): [`BalanceService`](BalanceService.md)

Get the balance service for balance queries

#### Returns

[`BalanceService`](BalanceService.md)

BalanceService instance for balance-related business logic

***

### getChainService()

> **getChainService**(): [`ChainService`](ChainService.md)

Get the chain service for chain management operations

#### Returns

[`ChainService`](ChainService.md)

ChainService instance for chain-related business logic

***

### getConnection()

> **getConnection**(`walletId`): `undefined` \| [`WalletAdapter`](../interfaces/WalletAdapter.md)

Get a specific wallet connection

#### Parameters

##### walletId

`string`

ID of the wallet

#### Returns

`undefined` \| [`WalletAdapter`](../interfaces/WalletAdapter.md)

The wallet adapter if connected, undefined otherwise

***

### getConnections()

> **getConnections**(): [`WalletAdapter`](../interfaces/WalletAdapter.md)[]

Get all connected wallet adapters

#### Returns

[`WalletAdapter`](../interfaces/WalletAdapter.md)[]

Array of connected wallet adapters

***

### getConnectionService()

> **getConnectionService**(): [`ConnectionService`](ConnectionService.md)

Get the connection service for connection management operations

#### Returns

[`ConnectionService`](ConnectionService.md)

ConnectionService instance for connection-related business logic

***

### getCurrentTransaction()

> **getCurrentTransaction**(): `null` \| [`TransactionResult`](../interfaces/TransactionResult.md)

Get current transaction from store

#### Returns

`null` \| [`TransactionResult`](../interfaces/TransactionResult.md)

Current transaction or null

***

### getMaxConnections()

> **getMaxConnections**(): `number`

Get the maximum number of concurrent connections

#### Returns

`number`

Maximum connection limit

***

### getPreferenceService()

> **getPreferenceService**(): [`ConnectionService`](ConnectionService.md)

Get the preference service for wallet preferences and history

#### Returns

[`ConnectionService`](ConnectionService.md)

WalletPreferenceService instance for preference-related business logic

***

### getServices()

> **getServices**(): `object`

Get all services in a single object for convenience

#### Returns

`object`

Object containing all business logic services

##### balance

> **balance**: [`BalanceService`](BalanceService.md)

##### chain

> **chain**: [`ChainService`](ChainService.md)

##### connection

> **connection**: [`ConnectionService`](ConnectionService.md)

##### dappRpc

> **dappRpc**: [`DAppRpcService`](DAppRpcService.md)

##### health

> **health**: [`HealthService`](HealthService.md)

##### preference

> **preference**: [`WalletPreferenceService`](WalletPreferenceService.md)

##### session

> **session**: [`SessionService`](SessionService.md)

##### transaction

> **transaction**: [`TransactionService`](TransactionService.md)

##### ui

> **ui**: [`UIService`](UIService.md)

***

### getState()

> **getState**(): [`HeadlessModalState`](../interfaces/HeadlessModalState.md)

Get current modal state

#### Returns

[`HeadlessModalState`](../interfaces/HeadlessModalState.md)

Current modal state

***

### getTransaction()

> **getTransaction**(`txId`): `undefined` \| [`TransactionResult`](../interfaces/TransactionResult.md)

Get transaction by ID from store

#### Parameters

##### txId

`string`

Transaction ID

#### Returns

`undefined` \| [`TransactionResult`](../interfaces/TransactionResult.md)

Transaction result or undefined

***

### getTransactionHistory()

> **getTransactionHistory**(): [`TransactionResult`](../interfaces/TransactionResult.md)[]

Get transaction history from store

#### Returns

[`TransactionResult`](../interfaces/TransactionResult.md)[]

Array of transaction results sorted by start time

***

### getTransactionService()

> **getTransactionService**(): [`TransactionService`](TransactionService.md)

Get the transaction service for transaction operations

#### Returns

[`TransactionService`](TransactionService.md)

TransactionService instance for transaction-related business logic

***

### getTransactionStatus()

> **getTransactionStatus**(): [`TransactionStatus`](../type-aliases/TransactionStatus.md)

Get current transaction status from store

#### Returns

[`TransactionStatus`](../type-aliases/TransactionStatus.md)

Current transaction status

***

### getWallet()

> **getWallet**(`walletId`): `undefined` \| [`WalletAdapter`](../interfaces/WalletAdapter.md)

Get a specific wallet adapter

#### Parameters

##### walletId

`string`

ID of the wallet

#### Returns

`undefined` \| [`WalletAdapter`](../interfaces/WalletAdapter.md)

The wallet adapter if registered, undefined otherwise

***

### initialize()

> **initialize**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Initialize the client and all its services

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when initialization is complete

***

### on()

> **on**(`event`, `handler`): () => `void`

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

> **openModal**(`options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Open the wallet selection modal

#### Parameters

##### options?

###### targetChainType?

[`ChainType`](../enumerations/ChainType.md)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when modal is opened

***

### sendTransaction()

> **sendTransaction**\<`T`\>(`request`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`TransactionResult`](../interfaces/TransactionResult.md)\>

Send a transaction through the active wallet

#### Type Parameters

##### T

`T` *extends* [`ChainType`](../enumerations/ChainType.md) = [`ChainType`](../enumerations/ChainType.md)

#### Parameters

##### request

[`TransactionRequest`](../type-aliases/TransactionRequest.md)\<`T`\>

Transaction request parameters

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`TransactionResult`](../interfaces/TransactionResult.md)\>

Promise resolving to transaction result

#### Throws

If no wallet is connected or transaction fails

***

### setActiveWallet()

> **setActiveWallet**(`walletId`): `void`

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

> **switchChain**(`chain`, `walletId?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `chain`: \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}; `chainType`: [`ChainType`](../enumerations/ChainType.md); `previousChain`: \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}; `provider`: `unknown`; \}\>

Switch to a different blockchain network

#### Parameters

##### chain

Chain to switch to

###### chainId

`string` = `caip2Schema`

Chain identifier in CAIP-2 format

###### chainType

[`ChainType`](../enumerations/ChainType.md) = `chainTypeSchema`

Type of blockchain this chain belongs to

###### group?

`string` = `...`

Grouping identifier for multi-chain scenarios

###### icon?

`string` = `...`

Optional icon URL for the chain

###### interfaces?

`string`[] = `...`

List of required provider interfaces for this chain

###### label?

`string` = `...`

Display label for the chain (optional override of name)

###### name

`string` = `...`

Human-readable name of the chain

###### required

`boolean` = `...`

Whether this chain is required for the dApp to function

##### walletId?

`string`

Optional wallet ID. Uses active wallet if not specified

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `chain`: \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}; `chainType`: [`ChainType`](../enumerations/ChainType.md); `previousChain`: \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}; `provider`: `unknown`; \}\>

Promise resolving to chain switch result
