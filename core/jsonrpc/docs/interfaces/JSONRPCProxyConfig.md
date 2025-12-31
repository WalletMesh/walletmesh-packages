[**@walletmesh/jsonrpc v0.5.4**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCProxyConfig

# Interface: JSONRPCProxyConfig

Defined in: [core/jsonrpc/src/proxy.ts:5](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/proxy.ts#L5)

## Properties

### chainId?

> `optional` **chainId**: `string`

Defined in: [core/jsonrpc/src/proxy.ts:13](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/proxy.ts#L13)

Chain ID for logging context

***

### debug?

> `optional` **debug**: `boolean`

Defined in: [core/jsonrpc/src/proxy.ts:9](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/proxy.ts#L9)

Enable debug logging

***

### logger()?

> `optional` **logger**: (`message`, `data?`) => `void`

Defined in: [core/jsonrpc/src/proxy.ts:11](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/proxy.ts#L11)

Custom logger function

#### Parameters

##### message

`string`

##### data?

`unknown`

#### Returns

`void`

***

### onNotification()?

> `optional` **onNotification**: (`method`, `params`, `rawMessage`) => `void`

Defined in: [core/jsonrpc/src/proxy.ts:18](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/proxy.ts#L18)

Optional callback invoked when a notification (request without id) is received
from the remote endpoint.

#### Parameters

##### method

`string`

##### params

`unknown`

##### rawMessage

`unknown`

#### Returns

`void`

***

### timeoutMs?

> `optional` **timeoutMs**: `number`

Defined in: [core/jsonrpc/src/proxy.ts:7](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/proxy.ts#L7)

Timeout for requests in milliseconds
