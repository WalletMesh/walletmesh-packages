[**@walletmesh/modal-core v0.0.1**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / ProviderLoaderConfig

# Interface: ProviderLoaderConfig

Provider loader configuration

## Properties

### customProviders?

> `optional` **customProviders**: `Record`\<[`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md), [`ProviderLoaderFunction`](../type-aliases/ProviderLoaderFunction.md)\>

Custom provider loaders

***

### logger?

> `optional` **logger**: [`Logger`](../../../../@walletmesh/modal-core/classes/Logger.md)

Logger instance for debugging

***

### preloadChainTypes?

> `optional` **preloadChainTypes**: [`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)[]

Chain types to preload (if preloadOnInit is true)

***

### preloadOnInit?

> `optional` **preloadOnInit**: `boolean`

Whether to preload configured providers on initialization
