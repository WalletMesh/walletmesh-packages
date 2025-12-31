[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletRegistry

# Class: WalletRegistry

Registry for managing wallet adapters

Central registry that tracks all available wallet adapters.
Provides methods to register, unregister, and query adapters
based on various criteria like chain support and features.

## Example

```typescript
const registry = new WalletRegistry();

// Register adapters
registry.register(new MetaMaskAdapter());
registry.register(new PhantomAdapter());

// Query adapters
const evmAdapters = registry.getAdaptersForChain(ChainType.Evm);
const adapter = registry.getAdapter('metamask');
```

## Constructors

### Constructor

> **new WalletRegistry**(): `WalletRegistry`

#### Returns

`WalletRegistry`

## Methods

### clear()

> **clear**(): `void`

Clear all adapters

Removes all registered adapters from the registry.
Use with caution as this will make all wallets unavailable.

#### Returns

`void`

#### Example

```typescript
registry.clear(); // All adapters removed
```

***

### clearDiscoveredWallets()

> **clearDiscoveredWallets**(): `void`

Clear all discovered wallets

#### Returns

`void`

***

### detectAvailableAdapters()

> **detectAvailableAdapters**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AvailableWallet`](../interfaces/AvailableWallet.md)[]\>

Detect which adapters are available in the current environment

Checks each registered adapter to see if its wallet is installed
and available in the current browser/environment. This is useful
for showing only available wallets in the connection UI.

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AvailableWallet`](../interfaces/AvailableWallet.md)[]\>

Promise resolving to array of detection results

#### Example

```typescript
const detected = await registry.detectAvailableAdapters();
const available = detected.filter(d => d.available);
console.log(`Found ${available.length} wallets installed`);
```

***

### getAdapter()

> **getAdapter**(`id`): `undefined` \| [`WalletAdapter`](../interfaces/WalletAdapter.md)

Get a specific adapter by ID

Retrieves a wallet adapter by its unique identifier.
If the adapter was registered as a class, it will be instantiated on first access.

#### Parameters

##### id

`string`

The adapter ID to look up

#### Returns

`undefined` \| [`WalletAdapter`](../interfaces/WalletAdapter.md)

The wallet adapter if found, undefined otherwise

#### Example

```typescript
const adapter = registry.getAdapter('metamask');
if (adapter) {
  const connector = adapter.createConnector(config);
}
```

***

### getAdaptersByFeature()

> **getAdaptersByFeature**(`feature`): [`WalletAdapter`](../interfaces/WalletAdapter.md)[]

Get adapters that support a specific feature

Filters adapters based on their supported features such as
message signing, encryption, multi-account support, etc.

#### Parameters

##### feature

[`WalletFeature`](../type-aliases/WalletFeature.md)

The wallet feature to filter by

#### Returns

[`WalletAdapter`](../interfaces/WalletAdapter.md)[]

Array of adapters that support the feature

#### Example

```typescript
const signingAdapters = registry.getAdaptersByFeature('sign_message');
const multiAccountAdapters = registry.getAdaptersByFeature('multi_account');
```

***

### getAdaptersForChain()

> **getAdaptersForChain**(`chainType`): [`WalletAdapter`](../interfaces/WalletAdapter.md)[]

Get adapters that support a specific chain type

Filters the registered adapters to find those that support
the specified blockchain type (EVM, Solana, etc).

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

The blockchain type to filter by

#### Returns

[`WalletAdapter`](../interfaces/WalletAdapter.md)[]

Array of adapters that support the chain type

#### Example

```typescript
const evmAdapters = registry.getAdaptersForChain(ChainType.Evm);
const solanaAdapters = registry.getAdaptersForChain(ChainType.Solana);
```

***

### getAllAdapters()

> **getAllAdapters**(): [`WalletAdapter`](../interfaces/WalletAdapter.md)[]

Get all registered adapters

Returns an array of all wallet adapters currently registered.
Note: This will NOT instantiate adapter classes.

#### Returns

[`WalletAdapter`](../interfaces/WalletAdapter.md)[]

Array of all registered wallet adapters

#### Example

```typescript
const allAdapters = registry.getAllAdapters();
console.log(`${allAdapters.length} wallets available`);
```

***

### getAllDiscoveredWallets()

> **getAllDiscoveredWallets**(): [`DiscoveredWalletInfo`](../interfaces/DiscoveredWalletInfo.md)[]

Get all discovered wallets

#### Returns

[`DiscoveredWalletInfo`](../interfaces/DiscoveredWalletInfo.md)[]

Array of all discovered wallet information

***

### getAllWalletInfo()

> **getAllWalletInfo**(): [`WalletInfo`](../interfaces/WalletInfo.md)[]

Get wallet info for all registered wallets

Returns wallet information for all registered wallets, including
those registered as classes (without instantiating them).

#### Returns

[`WalletInfo`](../interfaces/WalletInfo.md)[]

Array of wallet information

#### Example

```typescript
const allWallets = registry.getAllWalletInfo();
console.log(`${allWallets.length} wallets available`);
```

***

### getBuiltinWalletIds()

> **getBuiltinWalletIds**(): `string`[]

Get list of all built-in wallet IDs

Returns an array of wallet IDs for all wallets that were registered
as built-in wallets.

#### Returns

`string`[]

Array of built-in wallet IDs

#### Example

```typescript
const builtInIds = registry.getBuiltinWalletIds();
console.log('Built-in wallets:', builtInIds);
```

***

### getDiscoveredWallet()

> **getDiscoveredWallet**(`walletId`): `undefined` \| [`DiscoveredWalletInfo`](../interfaces/DiscoveredWalletInfo.md)

Get discovered wallet information

#### Parameters

##### walletId

`string`

The ID of the discovered wallet

#### Returns

`undefined` \| [`DiscoveredWalletInfo`](../interfaces/DiscoveredWalletInfo.md)

Wallet information if found

***

### hasDiscoveredWallet()

> **hasDiscoveredWallet**(`walletId`): `boolean`

Check if a wallet has been discovered

#### Parameters

##### walletId

`string`

The ID of the wallet

#### Returns

`boolean`

True if the wallet has been discovered

***

### isBuiltinWallet()

> **isBuiltinWallet**(`walletId`): `boolean`

Check if a wallet is a built-in wallet

Returns true if the wallet was registered using registerBuiltIn(),
indicating it's a pre-registered wallet that's part of the core package.

#### Parameters

##### walletId

`string`

The ID of the wallet to check

#### Returns

`boolean`

True if the wallet is built-in, false otherwise

#### Example

```typescript
if (registry.isBuiltinWallet('debug-wallet')) {
  console.log('This is a built-in wallet');
}
```

***

### loadAdapters()

> **loadAdapters**(`adapters`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Load multiple adapters at once

Convenience method to register multiple adapters in a single call.

#### Parameters

##### adapters

[`WalletAdapter`](../interfaces/WalletAdapter.md)[]

Array of wallet adapters to register

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Example

```typescript
await registry.loadAdapters([
  new MetaMaskAdapter(),
  new PhantomAdapter(),
  new CoinbaseAdapter()
]);
```

***

### loadBuiltinAdapters()

> **loadBuiltinAdapters**(`filter?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Load all built-in adapters

Convenience method to load all available built-in wallet adapters.
This is the most common use case for dynamic adapter loading.

#### Parameters

##### filter?

Optional filter to only load specific adapters

`string` | `RegExp`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when all adapters are loaded

#### Example

```typescript
// Load all built-in adapters
await registry.loadBuiltinAdapters();

// Load only MetaMask-related adapters
await registry.loadBuiltinAdapters(/metamask/i);

// Load adapters matching a string pattern
await registry.loadBuiltinAdapters('meta');
```

***

### loadFromPackage()

> **loadFromPackage**(`packageName`, `options`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Load adapters from an npm package

Convenience method to load wallet adapters from an npm package.

#### Parameters

##### packageName

`string`

Name of the npm package to load adapters from

##### options

Loading options

###### continueOnError?

`boolean`

###### filter?

`string` \| `RegExp`

###### maxAdapters?

`number`

###### timeout?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when adapters are loaded

#### Example

```typescript
// Load from a third-party wallet adapter package
await registry.loadFromPackage('@mycompany/wallet-adapters');

// Load with filtering
await registry.loadFromPackage('@walletconnect/adapters', {
  filter: /ethereum/i,
  maxAdapters: 5
});
```

***

### on()

> **on**(`event`, `handler`): `void`

Subscribe to registry events

Listen for adapter registration and unregistration events.

#### Parameters

##### event

`string`

Event name ('adapter:registered' or 'adapter:unregistered')

##### handler

(`data`) => `void`

Event handler function

#### Returns

`void`

#### Example

```typescript
registry.on('adapter:registered', (adapter) => {
  console.log(`New wallet registered: ${adapter.metadata.name}`);
});
```

***

### register()

> **register**(`adapter`): `void`

Register a wallet adapter

Adds a wallet adapter to the registry. Each adapter must have
a unique ID. Attempting to register an adapter with a duplicate
ID will throw an error.

#### Parameters

##### adapter

[`WalletAdapter`](../interfaces/WalletAdapter.md)

The wallet adapter to register

#### Returns

`void`

#### Throws

If an adapter with the same ID is already registered

#### Example

```typescript
const adapter = new MetaMaskAdapter();
registry.register(adapter);
```

***

### registerBuiltIn()

> **registerBuiltIn**(`adapter`): `void`

Register a built-in wallet adapter

Registers a wallet adapter and marks it as built-in. Built-in adapters
are pre-registered wallets that are part of the core package (e.g.,
debug-wallet, aztec-example-wallet) and should not be treated as
discovered wallets.

#### Parameters

##### adapter

[`WalletAdapter`](../interfaces/WalletAdapter.md)

The built-in wallet adapter to register

#### Returns

`void`

#### Throws

If an adapter with the same ID is already registered

#### Example

```typescript
const adapter = new DebugWallet();
registry.registerBuiltIn(adapter);
```

***

### registerClass()

> **registerClass**(`adapterClass`, `walletInfo`): `void`

Register a wallet adapter class for lazy instantiation

Stores a wallet adapter class without instantiating it. The adapter
will be instantiated only when needed (when user selects it).

#### Parameters

##### adapterClass

[`WalletAdapterConstructor`](../../../internal/types/typedocExports/interfaces/WalletAdapterConstructor.md)

The wallet adapter class constructor

##### walletInfo

[`WalletInfo`](../interfaces/WalletInfo.md)

Pre-extracted wallet information

#### Returns

`void`

#### Example

```typescript
const walletInfo = AztecExampleWalletAdapter.getWalletInfo();
registry.registerClass(AztecExampleWalletAdapter, walletInfo);
```

***

### registerDiscoveredWallet()

> **registerDiscoveredWallet**(`walletInfo`): `void`

Register discovered wallet information

Stores information about a discovered wallet that can be used
to create an adapter on-demand when the user selects it.

#### Parameters

##### walletInfo

[`DiscoveredWalletInfo`](../interfaces/DiscoveredWalletInfo.md)

Information about the discovered wallet

#### Returns

`void`

#### Example

```typescript
registry.registerDiscoveredWallet({
  id: 'io.metamask',
  name: 'MetaMask',
  icon: 'data:...',
  adapterType: 'evm',
  adapterConfig: { provider: discoveredProvider }
});
```

***

### removeDiscoveredWallet()

> **removeDiscoveredWallet**(`walletId`): `void`

Remove discovered wallet information

#### Parameters

##### walletId

`string`

The ID of the wallet to remove

#### Returns

`void`

***

### unregister()

> **unregister**(`adapterId`): `void`

Unregister a wallet adapter

Removes a wallet adapter from the registry by its ID.
If the adapter is not found, this method does nothing.

#### Parameters

##### adapterId

`string`

The ID of the adapter to remove

#### Returns

`void`

#### Example

```typescript
registry.unregister('metamask');
```
