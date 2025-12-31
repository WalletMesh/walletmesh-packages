[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DAppRpcIntegration

# Class: DAppRpcIntegration

Integration service for dApp RPC functionality

This service handles the setup and configuration of dApp RPC endpoints
based on the WalletMesh client configuration.

## Constructors

### Constructor

> **new DAppRpcIntegration**(`logger`): `DAppRpcIntegration`

#### Parameters

##### logger

[`Logger`](Logger.md)

#### Returns

`DAppRpcIntegration`

## Methods

### getDAppRpcService()

> **getDAppRpcService**(): [`DAppRpcService`](DAppRpcService.md)

Get the dApp RPC service instance

#### Returns

[`DAppRpcService`](DAppRpcService.md)

The dApp RPC service instance

***

### getStats()

> **getStats**(): `object`

Get service statistics

#### Returns

`object`

Service statistics

##### chainIds

> **chainIds**: `string`[]

##### totalEndpoints

> **totalEndpoints**: `number`

##### totalUrls

> **totalUrls**: `number`

***

### initializeFromChainConfigs()

> **initializeFromChainConfigs**(`chainConfigs`): `void`

Initialize dApp RPC service with chain configurations

#### Parameters

##### chainConfigs

[`ChainConfig`](../../../internal/types/typedocExports/interfaces/ChainConfig.md)[]

Array of chain configurations from WalletMesh client

#### Returns

`void`

***

### testConnectivity()

> **testConnectivity**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`object`[]\>

Test connectivity to all configured dApp RPC endpoints

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`object`[]\>

Promise resolving to connectivity test results
