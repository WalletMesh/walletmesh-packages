[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ProviderEntry

# Interface: ProviderEntry

Defined in: core/modal-core/dist/internal/registries/providers/ProviderRegistry.d.ts:24

Provider registration entry

## Properties

### isBuiltIn

> **isBuiltIn**: `boolean`

Defined in: core/modal-core/dist/internal/registries/providers/ProviderRegistry.d.ts:32

Whether this provider is built-in

***

### loader?

> `optional` **loader**: [`ProviderLoader`](../type-aliases/ProviderLoader.md)

Defined in: core/modal-core/dist/internal/registries/providers/ProviderRegistry.d.ts:28

Loader function for lazy loading

***

### loadingPromise?

> `optional` **loadingPromise**: `Promise`\<`void`\>

Defined in: core/modal-core/dist/internal/registries/providers/ProviderRegistry.d.ts:30

Loading promise to prevent duplicate loads

***

### providerClass?

> `optional` **providerClass**: `ProviderClass`

Defined in: core/modal-core/dist/internal/registries/providers/ProviderRegistry.d.ts:26

Provider class constructor (if already loaded)
