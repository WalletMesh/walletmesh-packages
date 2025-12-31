[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ProviderRegistry

# Class: ProviderRegistry

Defined in: core/modal-core/dist/internal/registries/providers/ProviderRegistry.d.ts:62

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

Defined in: core/modal-core/dist/internal/registries/providers/ProviderRegistry.d.ts:139

Clear all registered providers
Useful for testing or resetting the registry

#### Returns

`void`

***

### createProvider()

> **createProvider**(`chainType`, `transport`, `initialChainId`, `logger`): `Promise`\<`WalletProvider`\>

Defined in: core/modal-core/dist/internal/registries/providers/ProviderRegistry.d.ts:109

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

[`Logger`](../interfaces/Logger.md)

#### Returns

`Promise`\<`WalletProvider`\>

Promise resolving to the provider instance

#### Throws

If no provider is registered for the chain type

***

### getProviderClass()

> **getProviderClass**(`chainType`): `Promise`\<`ProviderClass`\>

Defined in: core/modal-core/dist/internal/registries/providers/ProviderRegistry.d.ts:117

Get provider class for a chain type (loading if necessary)

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

The chain type to get provider for

#### Returns

`Promise`\<`ProviderClass`\>

Promise resolving to the provider class

#### Throws

If no provider is registered or loading fails

***

### getProviderInfo()

> **getProviderInfo**(): `object`[]

Defined in: core/modal-core/dist/internal/registries/providers/ProviderRegistry.d.ts:152

Get information about registered providers

#### Returns

`object`[]

Array of provider information

***

### getRegisteredChainTypes()

> **getRegisteredChainTypes**(): [`ChainType`](../enumerations/ChainType.md)[]

Defined in: core/modal-core/dist/internal/registries/providers/ProviderRegistry.d.ts:99

Get registered chain types

#### Returns

[`ChainType`](../enumerations/ChainType.md)[]

Array of registered chain types

***

### hasProvider()

> **hasProvider**(`chainType`): `boolean`

Defined in: core/modal-core/dist/internal/registries/providers/ProviderRegistry.d.ts:93

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

> **registerProvider**(`chainType`, `providerClass`, `isBuiltIn?`): `void`

Defined in: core/modal-core/dist/internal/registries/providers/ProviderRegistry.d.ts:78

Register a provider class directly

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

The chain type this provider handles

##### providerClass

`ProviderClass`

The provider class constructor

##### isBuiltIn?

`boolean`

Whether this is a built-in provider (default: false)

#### Returns

`void`

***

### registerProviderLoader()

> **registerProviderLoader**(`chainType`, `loader`, `isBuiltIn?`): `void`

Defined in: core/modal-core/dist/internal/registries/providers/ProviderRegistry.d.ts:86

Register a provider with lazy loading

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

The chain type this provider handles

##### loader

[`ProviderLoader`](../type-aliases/ProviderLoader.md)

Function that loads the provider module

##### isBuiltIn?

`boolean`

Whether this is a built-in provider (default: false)

#### Returns

`void`

***

### removeProvider()

> **removeProvider**(`chainType`): `boolean`

Defined in: core/modal-core/dist/internal/registries/providers/ProviderRegistry.d.ts:146

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

Defined in: core/modal-core/dist/internal/registries/providers/ProviderRegistry.d.ts:70

Get the singleton instance of the provider registry

#### Returns

`ProviderRegistry`

The provider registry instance
