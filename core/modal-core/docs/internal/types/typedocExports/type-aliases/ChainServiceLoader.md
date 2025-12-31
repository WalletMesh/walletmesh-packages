[**@walletmesh/modal-core v0.0.2**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / ChainServiceLoader

# Type Alias: ChainServiceLoader()

> **ChainServiceLoader** = () => [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `createAztecChainService?`: [`ChainServiceFactory`](ChainServiceFactory.md); `createEVMChainService?`: [`ChainServiceFactory`](ChainServiceFactory.md); `createSolanaChainService?`: [`ChainServiceFactory`](ChainServiceFactory.md); `default?`: [`ChainServiceFactory`](ChainServiceFactory.md); \}\>

Chain service loader function type for dynamic imports

## Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `createAztecChainService?`: [`ChainServiceFactory`](ChainServiceFactory.md); `createEVMChainService?`: [`ChainServiceFactory`](ChainServiceFactory.md); `createSolanaChainService?`: [`ChainServiceFactory`](ChainServiceFactory.md); `default?`: [`ChainServiceFactory`](ChainServiceFactory.md); \}\>
