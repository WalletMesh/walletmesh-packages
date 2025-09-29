[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletRegistry

# Class: WalletRegistry

Defined in: core/modal-core/dist/internal/registries/wallets/WalletRegistry.d.ts:26

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

Defined in: core/modal-core/dist/internal/registries/wallets/WalletRegistry.d.ts:351

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

Defined in: core/modal-core/dist/internal/registries/wallets/WalletRegistry.d.ts:339

Clear all discovered wallets

#### Returns

`void`

***

### detectAvailableAdapters()

> **detectAvailableAdapters**(): `Promise`\<[`AvailableWallet`](../interfaces/AvailableWallet.md)[]\>

Defined in: core/modal-core/dist/internal/registries/wallets/WalletRegistry.d.ts:175

Detect which adapters are available in the current environment

Checks each registered adapter to see if its wallet is installed
and available in the current browser/environment. This is useful
for showing only available wallets in the connection UI.

#### Returns

`Promise`\<[`AvailableWallet`](../interfaces/AvailableWallet.md)[]\>

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

Defined in: core/modal-core/dist/internal/registries/wallets/WalletRegistry.d.ts:96

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

Defined in: core/modal-core/dist/internal/registries/wallets/WalletRegistry.d.ts:158

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

Defined in: core/modal-core/dist/internal/registries/wallets/WalletRegistry.d.ts:142

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

Defined in: core/modal-core/dist/internal/registries/wallets/WalletRegistry.d.ts:111

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

> **getAllDiscoveredWallets**(): `DiscoveredWalletInfo`[]

Defined in: core/modal-core/dist/internal/registries/wallets/WalletRegistry.d.ts:322

Get all discovered wallets

#### Returns

`DiscoveredWalletInfo`[]

Array of all discovered wallet information

***

### getAllWalletInfo()

> **getAllWalletInfo**(): [`WalletInfo`](../interfaces/WalletInfo.md)[]

Defined in: core/modal-core/dist/internal/registries/wallets/WalletRegistry.d.ts:126

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

### getDiscoveredWallet()

> **getDiscoveredWallet**(`walletId`): `undefined` \| `DiscoveredWalletInfo`

Defined in: core/modal-core/dist/internal/registries/wallets/WalletRegistry.d.ts:316

Get discovered wallet information

#### Parameters

##### walletId

`string`

The ID of the discovered wallet

#### Returns

`undefined` \| `DiscoveredWalletInfo`

Wallet information if found

***

### hasDiscoveredWallet()

> **hasDiscoveredWallet**(`walletId`): `boolean`

Defined in: core/modal-core/dist/internal/registries/wallets/WalletRegistry.d.ts:329

Check if a wallet has been discovered

#### Parameters

##### walletId

`string`

The ID of the wallet

#### Returns

`boolean`

True if the wallet has been discovered

***

### loadAdapters()

> **loadAdapters**(`adapters`): `Promise`\<`void`\>

Defined in: core/modal-core/dist/internal/registries/wallets/WalletRegistry.d.ts:192

Load multiple adapters at once

Convenience method to register multiple adapters in a single call.

#### Parameters

##### adapters

[`WalletAdapter`](../interfaces/WalletAdapter.md)[]

Array of wallet adapters to register

#### Returns

`Promise`\<`void`\>

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

> **loadBuiltinAdapters**(`filter?`): `Promise`\<`void`\>

Defined in: core/modal-core/dist/internal/registries/wallets/WalletRegistry.d.ts:373

Load all built-in adapters

Convenience method to load all available built-in wallet adapters.
This is the most common use case for dynamic adapter loading.

#### Parameters

##### filter?

Optional filter to only load specific adapters

`string` | `RegExp`

#### Returns

`Promise`\<`void`\>

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

> **loadFromPackage**(`packageName`, `options?`): `Promise`\<`void`\>

Defined in: core/modal-core/dist/internal/registries/wallets/WalletRegistry.d.ts:395

Load adapters from an npm package

Convenience method to load wallet adapters from an npm package.

#### Parameters

##### packageName

`string`

Name of the npm package to load adapters from

##### options?

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

`Promise`\<`void`\>

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

Defined in: core/modal-core/dist/internal/registries/wallets/WalletRegistry.d.ts:284

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

Defined in: core/modal-core/dist/internal/registries/wallets/WalletRegistry.d.ts:48

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

### registerClass()

> **registerClass**(`adapterClass`, `walletInfo`): `void`

Defined in: core/modal-core/dist/internal/registries/wallets/WalletRegistry.d.ts:64

Register a wallet adapter class for lazy instantiation

Stores a wallet adapter class without instantiating it. The adapter
will be instantiated only when needed (when user selects it).

#### Parameters

##### adapterClass

`WalletAdapterConstructor`

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

Defined in: core/modal-core/dist/internal/registries/wallets/WalletRegistry.d.ts:309

Register discovered wallet information

Stores information about a discovered wallet that can be used
to create an adapter on-demand when the user selects it.

#### Parameters

##### walletInfo

`DiscoveredWalletInfo`

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

Defined in: core/modal-core/dist/internal/registries/wallets/WalletRegistry.d.ts:335

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

Defined in: core/modal-core/dist/internal/registries/wallets/WalletRegistry.d.ts:78

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
