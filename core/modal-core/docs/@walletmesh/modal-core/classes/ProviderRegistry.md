[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ProviderRegistry

# Class: ProviderRegistry

Registry for managing wallet provider classes with lazy loading support

This registry allows registration of provider classes either directly
or via lazy loaders. This is particularly useful for heavy providers
like Aztec (40+ MB) that should only be loaded when needed.

## Example

```typescript
// Register a provider directly
registry.registerProvider(ChainType.Evm, EvmProvider);

// Register a provider with lazy loading
registry.registerProviderLoader(
  ChainType.Aztec,
  () => import('@walletmesh/modal-core/providers/aztec')
);

// Create a provider instance
const provider = await registry.createProvider(
  ChainType.Evm,
  transport,
  '0x1',
  logger
);
```

## Constructors

### Constructor

> **new ProviderRegistry**(): `ProviderRegistry`

#### Returns

`ProviderRegistry`

## Methods

### clear()

> **clear**(): `void`

Clear all registered providers
Useful for testing or resetting the registry

#### Returns

`void`

***

### createProvider()

> **createProvider**(`chainType`, `transport`, `initialChainId`, `logger`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletProvider`](../../../internal/types/typedocExports/type-aliases/WalletProvider.md)\>

Create a provider instance for the specified chain type

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

The chain type to create a provider for

##### transport

`JSONRPCTransport`

JSON-RPC transport for communication

##### initialChainId

Initial chain ID (optional)

`undefined` | `string`

##### logger

[`Logger`](Logger.md)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletProvider`](../../../internal/types/typedocExports/type-aliases/WalletProvider.md)\>

Promise resolving to the provider instance

#### Throws

If no provider is registered for the chain type

***

### getProviderClass()

> **getProviderClass**(`chainType`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ProviderClass`](../type-aliases/ProviderClass.md)\>

Get provider class for a chain type (loading if necessary)

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

The chain type to get provider for

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ProviderClass`](../type-aliases/ProviderClass.md)\>

Promise resolving to the provider class

#### Throws

If no provider is registered or loading fails

***

### getProviderInfo()

> **getProviderInfo**(): `object`[]

Get information about registered providers

#### Returns

`object`[]

Array of provider information

***

### getRegisteredChainTypes()

> **getRegisteredChainTypes**(): [`ChainType`](../enumerations/ChainType.md)[]

Get registered chain types

#### Returns

[`ChainType`](../enumerations/ChainType.md)[]

Array of registered chain types

***

### hasProvider()

> **hasProvider**(`chainType`): `boolean`

Check if a provider is registered for a chain type

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

The chain type to check

#### Returns

`boolean`

Whether a provider is registered

***

### registerProvider()

> **registerProvider**(`chainType`, `providerClass`, `isBuiltIn`): `void`

Register a provider class directly

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

The chain type this provider handles

##### providerClass

[`ProviderClass`](../type-aliases/ProviderClass.md)

The provider class constructor

##### isBuiltIn

`boolean` = `false`

Whether this is a built-in provider (default: false)

#### Returns

`void`

***

### registerProviderLoader()

> **registerProviderLoader**(`chainType`, `loader`, `isBuiltIn`): `void`

Register a provider with lazy loading

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

The chain type this provider handles

##### loader

[`ProviderLoader`](../type-aliases/ProviderLoader.md)

Function that loads the provider module

##### isBuiltIn

`boolean` = `false`

Whether this is a built-in provider (default: false)

#### Returns

`void`

***

### removeProvider()

> **removeProvider**(`chainType`): `boolean`

Remove a specific provider registration

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

The chain type to remove

#### Returns

`boolean`

Whether a provider was removed

***

### getInstance()

> `static` **getInstance**(): `ProviderRegistry`

Get the singleton instance of the provider registry

#### Returns

`ProviderRegistry`

The provider registry instance
