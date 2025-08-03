[**@walletmesh/jsonrpc v0.5.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCProxyConfig

# Interface: JSONRPCProxyConfig

Defined in: [core/jsonrpc/src/proxy.ts:5](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/proxy.ts#L5)

## Properties

### chainId?

> `optional` **chainId**: `string`

Defined in: [core/jsonrpc/src/proxy.ts:13](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/proxy.ts#L13)

Chain ID for logging context

***

### debug?

> `optional` **debug**: `boolean`

Defined in: [core/jsonrpc/src/proxy.ts:9](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/proxy.ts#L9)

Enable debug logging

***

### logger()?

> `optional` **logger**: (`message`, `data?`) => `void`

Defined in: [core/jsonrpc/src/proxy.ts:11](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/proxy.ts#L11)

Custom logger function

#### Parameters

##### message

`string`

##### data?

`unknown`

#### Returns

`void`

***

### timeoutMs?

> `optional` **timeoutMs**: `number`

Defined in: [core/jsonrpc/src/proxy.ts:7](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/proxy.ts#L7)

Timeout for requests in milliseconds
