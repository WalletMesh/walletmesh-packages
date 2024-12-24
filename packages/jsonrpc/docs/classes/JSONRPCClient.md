[@walletmesh/jsonrpc - v0.0.5](../README.md) / [Exports](../modules.md) / JSONRPCClient

# Class: JSONRPCClient\<T\>

JSONRPCClient class for sending requests and handling responses.

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | extends [`JSONRPCMethodMap`](../modules.md#jsonrpcmethodmap) | The RPC method map. |

## Table of contents

### Constructors

- [constructor](JSONRPCClient.md#constructor)

### Methods

- [callMethod](JSONRPCClient.md#callmethod)
- [notify](JSONRPCClient.md#notify)
- [receiveResponse](JSONRPCClient.md#receiveresponse)
- [registerSerializer](JSONRPCClient.md#registerserializer)

## Constructors

### constructor

• **new JSONRPCClient**\<`T`\>(`sendRequest`): [`JSONRPCClient`](JSONRPCClient.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`JSONRPCMethodMap`](../modules.md#jsonrpcmethodmap) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `sendRequest` | (`request`: [`JSONRPCRequest`](../interfaces/JSONRPCRequest.md)\<`T`, keyof `T`, [`JSONRPCParams`](../modules.md#jsonrpcparams)\>) => `void` |

#### Returns

[`JSONRPCClient`](JSONRPCClient.md)\<`T`\>

#### Defined in

[packages/jsonrpc/src/client.ts:47](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/client.ts#L47)

## Methods

### callMethod

▸ **callMethod**\<`M`\>(`method`, `params?`, `timeoutInSeconds?`): `Promise`\<`T`[`M`][``"result"``]\>

Calls a method on the JSON-RPC server.

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `M` | extends `string` \| `number` \| `symbol` | The method name. |

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `method` | `M` | `undefined` | The method name to call. |
| `params?` | `T`[`M`][``"params"``] | `undefined` | Optional parameters to pass to the method. |
| `timeoutInSeconds` | `number` | `0` | Timeout in seconds (0 means no timeout, default is 0). |

#### Returns

`Promise`\<`T`[`M`][``"result"``]\>

A Promise that resolves with the result or rejects with an error.

#### Defined in

[packages/jsonrpc/src/client.ts:69](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/client.ts#L69)

___

### notify

▸ **notify**\<`M`\>(`method`, `params`): `void`

Sends a notification to the JSON-RPC server (no response expected).

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `M` | extends `string` \| `number` \| `symbol` | The method name. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `method` | `M` | The method name to notify. |
| `params` | `T`[`M`][``"params"``] | Parameters to pass to the method. |

#### Returns

`void`

#### Defined in

[packages/jsonrpc/src/client.ts:115](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/client.ts#L115)

___

### receiveResponse

▸ **receiveResponse**(`response`): `void`

Handles incoming JSON-RPC responses.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `response` | [`JSONRPCResponse`](../interfaces/JSONRPCResponse.md)\<`T`, keyof `T`\> | The JSON-RPC response object. |

#### Returns

`void`

#### Defined in

[packages/jsonrpc/src/client.ts:133](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/client.ts#L133)

___

### registerSerializer

▸ **registerSerializer**\<`M`\>(`method`, `serializer`): `void`

Registers serializer for a method.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `method` | `M` |
| `serializer` | [`JSONRPCSerializer`](../interfaces/JSONRPCSerializer.md)\<`T`[`M`][``"params"``], `T`[`M`][``"result"``]\> |

#### Returns

`void`

#### Defined in

[packages/jsonrpc/src/client.ts:52](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/client.ts#L52)
