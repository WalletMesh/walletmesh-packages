[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DAppRpcConfig

# Interface: DAppRpcConfig

Configuration for dApp RPC endpoint behavior

## Properties

### headers?

> `optional` **headers**: `Record`\<`string`, `string`\>

Custom headers to include in RPC requests

***

### loadBalance?

> `optional` **loadBalance**: `boolean`

Whether to use round-robin load balancing across endpoints (default: true)

***

### retries?

> `optional` **retries**: `number`

Number of retry attempts on failure (default: 3)

***

### timeout?

> `optional` **timeout**: `number`

Timeout for RPC requests in milliseconds (default: 30000)
