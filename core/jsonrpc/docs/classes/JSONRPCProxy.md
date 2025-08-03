[**@walletmesh/jsonrpc v0.5.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCProxy

# Class: JSONRPCProxy

Defined in: [core/jsonrpc/src/proxy.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/proxy.ts#L28)

JSONRPCProxy enables transparent forwarding of JSON-RPC messages
without serialization or deserialization. This is useful for routers,
gateways, and other intermediaries that need to forward messages
without processing their contents.

Features:
- Transparent message forwarding
- Comprehensive logging
- Proper timeout handling with JSONRPCError integration
- Event forwarding for notifications

## Constructors

### Constructor

> **new JSONRPCProxy**(`transport`, `config`): `JSONRPCProxy`

Defined in: [core/jsonrpc/src/proxy.ts:42](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/proxy.ts#L42)

#### Parameters

##### transport

[`JSONRPCTransport`](../interfaces/JSONRPCTransport.md)

##### config

[`JSONRPCProxyConfig`](../interfaces/JSONRPCProxyConfig.md) = `{}`

#### Returns

`JSONRPCProxy`

## Methods

### close()

> **close**(): `void`

Defined in: [core/jsonrpc/src/proxy.ts:204](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/proxy.ts#L204)

Clean up all pending requests and close the proxy

#### Returns

`void`

***

### forward()

> **forward**(`message`): `Promise`\<`unknown`\>

Defined in: [core/jsonrpc/src/proxy.ts:63](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/proxy.ts#L63)

Forward a raw JSON-RPC message and return the response.
For notifications (no id), returns undefined.
For requests (with id), waits for and returns the response.

#### Parameters

##### message

`unknown`

#### Returns

`Promise`\<`unknown`\>
