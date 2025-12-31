[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DAppRpcService

# Class: DAppRpcService

dApp RPC Service for managing blockchain node communication

This service provides a dedicated RPC layer for dApps to communicate with
blockchain nodes using their own infrastructure, separate from wallet providers.

## Example

```typescript
const dappRpcService = new DAppRpcService({
  logger: createDebugLogger('DAppRpc', true)
});

// Register dApp RPC endpoints
dappRpcService.registerEndpoint({
  chainId: '1',
  chainType: ChainType.Evm,
  urls: [
    'https://your-primary-ethereum-node.com/rpc',
    'https://your-backup-ethereum-node.com/rpc'
  ],
  config: {
    timeout: 30000,
    retries: 3,
    loadBalance: true,
    headers: {
      'Authorization': 'Bearer your-api-key'
    }
  }
});

// Make RPC calls
const blockNumber = await dappRpcService.call('1', 'eth_blockNumber');
const balance = await dappRpcService.call('1', 'eth_getBalance', ['0x...', 'latest']);
```

## Constructors

### Constructor

> **new DAppRpcService**(`dependencies?`): `DAppRpcService`

Creates a new DAppRpcService instance

#### Parameters

##### dependencies?

`Partial`\<[`DAppRpcServiceDependencies`](../interfaces/DAppRpcServiceDependencies.md)\>

Optional service dependencies

#### Returns

`DAppRpcService`

## Methods

### batchCall()

> **batchCall**\<`T`\>(`chainId`, `requests`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`RpcResult`](../interfaces/RpcResult.md)\<`T`\>[]\>

Make a batch RPC call to a specific chain

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### chainId

`string`

The chain ID to call

##### requests

`object`[]

Array of RPC requests

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`RpcResult`](../interfaces/RpcResult.md)\<`T`\>[]\>

Promise resolving to array of RPC results

***

### call()

> **call**\<`T`\>(`chainId`, `method`, `params?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`RpcResult`](../interfaces/RpcResult.md)\<`T`\>\>

Make an RPC call to a specific chain

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### chainId

`string`

The chain ID to call

##### method

`string`

The RPC method name

##### params?

`unknown`[]

Optional parameters for the RPC call

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`RpcResult`](../interfaces/RpcResult.md)\<`T`\>\>

Promise resolving to the RPC result

#### Throws

If no endpoint is registered for the chain or all endpoints fail

***

### clear()

> **clear**(): `void`

Clear all registered endpoints

#### Returns

`void`

***

### getEndpointInfo()

> **getEndpointInfo**(`chainId`): `undefined` \| [`DAppRpcEndpoint`](../interfaces/DAppRpcEndpoint.md)

Get endpoint information for a chain

#### Parameters

##### chainId

`string`

The chain ID

#### Returns

`undefined` \| [`DAppRpcEndpoint`](../interfaces/DAppRpcEndpoint.md)

Endpoint information or undefined if not registered

***

### getRegisteredChains()

> **getRegisteredChains**(): `string`[]

Get all registered chain IDs

#### Returns

`string`[]

Array of chain IDs with dApp RPC endpoints

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

### hasEndpoint()

> **hasEndpoint**(`chainId`): `boolean`

Check if a dApp RPC endpoint is registered for a chain

#### Parameters

##### chainId

`string`

The chain ID to check

#### Returns

`boolean`

Whether an endpoint is registered

***

### registerEndpoint()

> **registerEndpoint**(`endpoint`): `void`

Register a dApp RPC endpoint for a specific chain

#### Parameters

##### endpoint

[`DAppRpcEndpoint`](../interfaces/DAppRpcEndpoint.md)

The endpoint configuration

#### Returns

`void`

***

### removeEndpoint()

> **removeEndpoint**(`chainId`): `boolean`

Remove a dApp RPC endpoint for a specific chain

#### Parameters

##### chainId

`string`

The chain ID to remove

#### Returns

`boolean`

Whether the endpoint was removed

***

### testConnectivity()

> **testConnectivity**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`object`[]\>

Test connectivity to all registered endpoints

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`object`[]\>

Promise resolving to connectivity test results
