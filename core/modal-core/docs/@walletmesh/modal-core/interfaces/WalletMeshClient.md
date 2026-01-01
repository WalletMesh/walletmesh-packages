[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletMeshClient

# Interface: WalletMeshClient

Core WalletMesh client interface defining the contract for all implementations.

This unified interface provides both public API methods and internal methods,
ensuring consistent behavior across different environments (browser, SSR, testing).
Framework adapters should program against this interface rather than concrete
implementations.

## Core Capabilities

### Connection Management
- `connect()` - Establish wallet connections with optional modal UI
- `disconnect()` - Terminate connections cleanly
- `disconnectAll()` - Bulk disconnection support
- `getConnection?()` - Get specific wallet connection (optional, internal)
- `getConnections?()` - Get all connected wallets (optional, internal)

### State Management
- `getState()` - Synchronous state access
- `subscribe()` - Reactive state subscriptions
- `isConnected` - Quick connection status check

### UI Control
- `openModal()` - Show wallet selection UI
- `closeModal()` - Hide wallet selection UI
- `modal` - Direct modal access for advanced use

### Optional Features
- `switchChain?()` - Cross-chain operations
- `getServices()` - Business logic services
- `initialize?()` - Async initialization
- Internal methods - Marked as optional for SSR compatibility

## Example

```typescript
// Type-safe client usage
function useWallet(client: WalletMeshClient) {
  // Subscribe to state changes
  useEffect(() => {
    return client.subscribe((state) => {
      console.log('State:', state.connection.state);
    });
  }, [client]);

  // Connect to wallet
  const handleConnect = async () => {
    const connection = await client.connect();
    if (connection) {
      console.log('Connected:', connection.address);
    }
  };
}
```

## Since

1.0.0

## Properties

### isConnected

> `readonly` **isConnected**: `boolean`

Indicates whether any wallet is currently connected.

***

### modal?

> `optional` **modal**: [`HeadlessModal`](HeadlessModal.md) \| [`ModalController`](ModalController.md)

Modal instance for programmatic control.
Provides access to modal state, actions, and UI without dependencies.
Optional to support two-phase construction pattern.

SSR clients use HeadlessModal (subset of functionality).
Browser clients use ModalController (full functionality).

## Methods

### closeModal()

> **closeModal**(): `void`

Closes the wallet selection modal.

Immediately hides the modal if it's currently visible.

#### Returns

`void`

***

### connect()

> **connect**(`walletId?`, `options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`WalletConnection`](WalletConnection.md)\>

Connects to a wallet.

If no walletId is provided, opens the modal for user selection.
Returns undefined in SSR environments for safety.

#### Parameters

##### walletId?

`string`

Optional ID of specific wallet to connect

##### options?

`unknown`

Optional wallet-specific connection options

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`WalletConnection`](WalletConnection.md)\>

Promise resolving to connection details or undefined

***

### connectWithModal()

> **connectWithModal**(`options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`WalletConnection`](WalletConnection.md)\>

Connects to a wallet by opening the modal and waiting for user selection.

This is a convenience method that combines `openModal()` and `connect()` into a single call,
simplifying the most common wallet connection pattern. The modal is automatically opened,
and the method waits for the user to select and connect to a wallet.

#### Parameters

##### options?

Optional connection options

###### chainType?

[`ChainType`](../enumerations/ChainType.md)

Filter wallets by chain type (e.g., 'evm', 'solana')

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`WalletConnection`](WalletConnection.md)\>

Promise resolving to connection details or undefined if cancelled

#### Example

```typescript
// Simple connection with modal
const connection = await client.connectWithModal();

// Filter to EVM wallets only
const connection = await client.connectWithModal({ chainType: ChainType.Evm });
```

#### Since

1.1.0

***

### destroy()

> **destroy**(): `void`

Cleans up all resources and connections.

Should be called when disposing of the client to prevent memory leaks
and ensure proper cleanup of event listeners and connections.

#### Returns

`void`

***

### disconnect()

> **disconnect**(`walletId?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Disconnects from wallet(s).

If no walletId is provided, disconnects all connected wallets.

#### Parameters

##### walletId?

`string`

Optional ID of specific wallet to disconnect

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when disconnection is complete

***

### disconnectAll()

> **disconnectAll**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Disconnects from all connected wallets.

Convenience method that ensures all wallet connections are properly
terminated and cleaned up.

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when all wallets are disconnected

***

### discoverWallets()

> **discoverWallets**(`options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`any`[]\>

Discovers available wallets in the user's environment.

Detects installed browser extensions, mobile wallets, and other
wallet providers available in the current environment. Can optionally
filter wallets based on chain types and capabilities.

#### Parameters

##### options?

`any`

Optional discovery request options to filter wallets

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`any`[]\>

Promise resolving to array of discovery results

#### Example

```typescript
// Discover all wallets
const wallets = await client.discoverWallets();

// Discover wallets with specific capabilities
const evmWallets = await client.discoverWallets({
  supportedChainTypes: [ChainType.Evm]
});
```

***

### getActions()

> **getActions**(): [`HeadlessModalActions`](HeadlessModalActions.md)

Gets available headless actions for programmatic control.

Provides methods for controlling the modal and connections without UI.

#### Returns

[`HeadlessModalActions`](HeadlessModalActions.md)

Object containing action methods

***

### getBalanceService()?

> `optional` **getBalanceService**(): `unknown`

Gets the balance service for querying wallet balances.

Optional method for checking token and native balances.

#### Returns

`unknown`

Balance service instance

***

### getChainService()?

> `optional` **getChainService**(): `unknown`

Gets the chain service for blockchain network operations.

Optional method for accessing chain-specific functionality.

#### Returns

`unknown`

Chain service instance

***

### getConnectionService()?

> `optional` **getConnectionService**(): `unknown`

Gets the connection service for wallet connection management.

Optional method for advanced connection operations.

#### Returns

`unknown`

Connection service instance

***

### getDAppRpcService()?

> `optional` **getDAppRpcService**(): `unknown`

Gets the dApp RPC service for direct blockchain communication.

Optional method for making RPC calls to blockchain nodes using
the application's own infrastructure.

#### Returns

`unknown`

dApp RPC service instance

***

### getPreferenceService()?

> `optional` **getPreferenceService**(): `unknown`

Gets the preference service for user preferences and history.

Optional method for managing wallet preferences and connection history.

#### Returns

`unknown`

Preference service instance

***

### getPublicProvider()

> **getPublicProvider**(`chainId`): `null` \| [`PublicProvider`](PublicProvider.md)

Gets a public provider for read-only operations on the specified chain.

Public providers use dApp-specified RPC endpoints, allowing applications
to control their infrastructure and costs for read operations.

#### Parameters

##### chainId

`string`

The chain ID to get a public provider for

#### Returns

`null` \| [`PublicProvider`](PublicProvider.md)

Public provider instance or null if not available

***

### getQueryManager()

> **getQueryManager**(): `unknown`

Gets the QueryManager for data fetching and caching.

#### Returns

`unknown`

QueryManager instance

***

### getServices()

> **getServices**(): `object`

Gets all business logic services.

Method providing access to high-level services for
transactions, balances, chains, and connections.

Services have been consolidated:
- connection: Now includes account, health, recovery, and session functionality
- chain: Now includes validation, registry, and switching functionality

#### Returns

`object`

Object containing all available services

##### balance

> **balance**: `unknown`

##### chain

> **chain**: `unknown`

##### connection

> **connection**: `unknown`

##### transaction

> **transaction**: `unknown`

***

### getState()

> **getState**(): [`HeadlessModalState`](HeadlessModalState.md)

Gets the current headless modal state.

Returns a snapshot of the current state including connection status,
available wallets, and modal visibility.

#### Returns

[`HeadlessModalState`](HeadlessModalState.md)

Current modal state object

***

### getTransactionService()?

> `optional` **getTransactionService**(): `unknown`

Gets the transaction service for blockchain transactions.

Optional method for sending and managing transactions.

#### Returns

`unknown`

Transaction service instance

***

### getWalletAdapter()

> **getWalletAdapter**(`walletId`): `null` \| [`WalletAdapter`](WalletAdapter.md)

Gets a wallet adapter by ID for provider-agnostic access.

This method provides access to the underlying wallet adapter,
enabling access to provider adapters and transport layers for
advanced use cases.

#### Parameters

##### walletId

`string`

ID of the wallet adapter to retrieve

#### Returns

`null` \| [`WalletAdapter`](WalletAdapter.md)

The wallet adapter instance or null if not found

***

### getWalletProvider()

> **getWalletProvider**(`chainId`): `null` \| [`WalletProvider`](../../../internal/types/typedocExports/type-aliases/WalletProvider.md)

Gets the wallet provider for write operations on the specified chain.

Wallet providers use the wallet's RPC endpoints, enabling transaction
signing and other privileged operations.

#### Parameters

##### chainId

`string`

The chain ID to get a wallet provider for

#### Returns

`null` \| [`WalletProvider`](../../../internal/types/typedocExports/type-aliases/WalletProvider.md)

Wallet provider instance or null if not connected

***

### initialize()?

> `optional` **initialize**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Initializes the client and all its services.

Optional method for implementations that require async initialization.
Should be called before using service methods.

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when initialization is complete

***

### openModal()

> **openModal**(`options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Opens the wallet selection modal.

#### Parameters

##### options?

Modal display options

###### targetChainType?

[`ChainType`](../enumerations/ChainType.md)

Target chain type to filter wallets

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when modal is opened

***

### subscribe()

> **subscribe**(`callback`): () => `void`

Subscribe to headless state changes.

#### Parameters

##### callback

(`state`) => `void`

Function called with updated state on each change

#### Returns

Unsubscribe function to stop receiving updates

> (): `void`

##### Returns

`void`

***

### switchChain()?

> `optional` **switchChain**(`chainId`, `walletId?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `previousChainId`: `string`; `provider`: `unknown`; \}\>

Switches to a different blockchain network.

Optional method that may not be available in all implementations
(e.g., SSR environments).

#### Parameters

##### chainId

`string`

ID of the target chain

##### walletId?

`string`

Optional wallet ID, uses active wallet if not specified

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `previousChainId`: `string`; `provider`: `unknown`; \}\>

Promise with switch details including new provider
