[**@walletmesh/modal-core v0.0.4**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / ProviderLoader

# Interface: ProviderLoader

Provider loader for lazy loading blockchain providers

This class manages dynamic imports of provider implementations,
reducing initial bundle size by only loading providers when needed.

## Example

```typescript
// Create provider loader
const loader = new ProviderLoader({
  preloadOnInit: true,
  preloadChainTypes: [ChainType.Evm, ChainType.Solana]
});

// Initialize and preload configured providers
await loader.initialize();

// Create a provider instance
const provider = await loader.createProvider(
  ChainType.Evm,
  transport,
  '0x1',
  logger
);
```

## Methods

### clearCache()

> **clearCache**(): `void`

Clear all cached providers

#### Returns

`void`

#### Remarks

This method clears all cached provider classes, forcing them to be
reloaded on next use. Useful for testing or hot reloading scenarios.

***

### createProvider()

> **createProvider**(`chainType`, `transport`, `initialChainId`, `logger`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletProvider`](../type-aliases/WalletProvider.md)\>

Create a provider instance

#### Parameters

##### chainType

[`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)

Chain type to create provider for

##### transport

`JSONRPCTransport`

JSON-RPC transport for communication

##### initialChainId

Initial chain ID (optional)

`undefined` | `string`

##### logger

[`Logger`](../../../../@walletmesh/modal-core/classes/Logger.md)

Logger instance for debugging

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletProvider`](../type-aliases/WalletProvider.md)\>

Promise resolving to provider instance

#### Throws

If no provider is registered or loading fails

***

### createProviderFactory()

> **createProviderFactory**(): [`ProviderFactory`](../type-aliases/ProviderFactory.md)

Create a provider factory function

#### Returns

[`ProviderFactory`](../type-aliases/ProviderFactory.md)

Provider factory function

***

### getProviderClass()

> **getProviderClass**(`chainType`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ProviderClass`](../../../../@walletmesh/modal-core/type-aliases/ProviderClass.md)\>

Get provider class for a chain type

#### Parameters

##### chainType

[`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)

Chain type to get provider for

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ProviderClass`](../../../../@walletmesh/modal-core/type-aliases/ProviderClass.md)\>

Promise resolving to provider class

#### Throws

If no provider is registered or loading fails

***

### getProviderInfo()

> **getProviderInfo**(): `object`[]

Get provider information for all registered providers

#### Returns

`object`[]

Array of provider information

***

### getProviderStatus()

> **getProviderStatus**(`chainType`): `object`

Get provider loading status

#### Parameters

##### chainType

[`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)

Chain type to check

#### Returns

`object`

Loading status information

##### isBuiltIn

> **isBuiltIn**: `boolean`

##### isLoaded

> **isLoaded**: `boolean`

##### isLoading

> **isLoading**: `boolean`

##### isRegistered

> **isRegistered**: `boolean`

***

### getRegisteredChainTypes()

> **getRegisteredChainTypes**(): [`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)[]

Get registered chain types

#### Returns

[`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)[]

Array of registered chain types

***

### hasProvider()

> **hasProvider**(`chainType`): `boolean`

Check if a provider is registered

#### Parameters

##### chainType

[`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)

Chain type to check

#### Returns

`boolean`

Whether a provider is registered

***

### initialize()

> **initialize**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Initialize the provider loader

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when initialization is complete

***

### preloadConfiguredProviders()

> **preloadConfiguredProviders**(`chainTypes`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Preload configured providers

#### Parameters

##### chainTypes

[`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)[]

Chain types to preload

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when all providers are loaded
