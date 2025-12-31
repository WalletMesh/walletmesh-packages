[**@walletmesh/jsonrpc v0.5.3**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCProxy

# Class: JSONRPCProxy

Defined in: [core/jsonrpc/src/proxy.ts:33](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/proxy.ts#L33)

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

Defined in: [core/jsonrpc/src/proxy.ts:47](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/proxy.ts#L47)

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

Defined in: [core/jsonrpc/src/proxy.ts:236](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/proxy.ts#L236)

Clean up all pending requests and close the proxy

#### Returns

`void`

***

### forward()

> **forward**(`message`): `Promise`\<`unknown`\>

Defined in: [core/jsonrpc/src/proxy.ts:68](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/proxy.ts#L68)

Forward a raw JSON-RPC message and return the response.
For notifications (no id), returns undefined.
For requests (with id), waits for and returns the response.

#### Parameters

##### message

`unknown`

#### Returns

`Promise`\<`unknown`\>
