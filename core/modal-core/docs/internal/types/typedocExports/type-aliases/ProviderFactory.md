[**@walletmesh/modal-core v0.0.1**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / ProviderFactory

# Type Alias: ProviderFactory()

> **ProviderFactory** = (`chainType`, `transport`, `initialChainId`, `logger`) => [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletProvider`](WalletProvider.md)\>

Provider factory function that creates provider instances

## Parameters

### chainType

[`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)

### transport

`JSONRPCTransport`

### initialChainId

`string` | `undefined`

### logger

[`Logger`](../../../../@walletmesh/modal-core/classes/Logger.md)

## Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletProvider`](WalletProvider.md)\>
