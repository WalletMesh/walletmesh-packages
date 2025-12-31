[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ProviderEntry

# Interface: ProviderEntry

Provider registration entry

## Properties

### isBuiltIn

> **isBuiltIn**: `boolean`

Whether this provider is built-in

***

### loader?

> `optional` **loader**: [`ProviderLoader`](../type-aliases/ProviderLoader.md)

Loader function for lazy loading

***

### loadingPromise?

> `optional` **loadingPromise**: [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Loading promise to prevent duplicate loads

***

### providerClass?

> `optional` **providerClass**: [`ProviderClass`](../type-aliases/ProviderClass.md)

Provider class constructor (if already loaded)
