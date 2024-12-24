[@walletmesh/jsonrpc - v0.0.5](../README.md) / [Exports](../modules.md) / JSONRPCServer

# Class: JSONRPCServer\<T, C\>

JSON-RPC server implementation.
Handles incoming requests, executes registered methods, and sends responses.

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | extends [`JSONRPCMethodMap`](../modules.md#jsonrpcmethodmap) | The RPC method map defining available methods |
| `C` | extends [`JSONRPCContext`](../modules.md#jsonrpccontext) | - |

## Table of contents

### Constructors

- [constructor](JSONRPCServer.md#constructor)

### Methods

- [addMiddleware](JSONRPCServer.md#addmiddleware)
- [receiveRequest](JSONRPCServer.md#receiverequest)
- [registerMethod](JSONRPCServer.md#registermethod)

## Constructors

### constructor

• **new JSONRPCServer**\<`T`, `C`\>(`sendResponse`): [`JSONRPCServer`](JSONRPCServer.md)\<`T`, `C`\>

Creates a new JSONRPCServer instance.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`JSONRPCMethodMap`](../modules.md#jsonrpcmethodmap) |
| `C` | extends [`JSONRPCContext`](../modules.md#jsonrpccontext) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sendResponse` | (`context`: `any`, `request`: [`JSONRPCRequest`](../interfaces/JSONRPCRequest.md)\<`any`, `string` \| `number` \| `symbol`, [`JSONRPCParams`](../modules.md#jsonrpcparams)\>, `response`: [`JSONRPCResponse`](../interfaces/JSONRPCResponse.md)\<`any`, `string` \| `number` \| `symbol`\>) => `Promise`\<`void`\> | A function that sends a JSON-RPC response, receiving context, request and response. |

#### Returns

[`JSONRPCServer`](JSONRPCServer.md)\<`T`, `C`\>

#### Defined in

[packages/jsonrpc/src/server.ts:55](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/server.ts#L55)

## Methods

### addMiddleware

▸ **addMiddleware**(`middleware`): () => `void`

Adds a middleware function to the stack.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `middleware` | [`JSONRPCMiddleware`](../modules.md#jsonrpcmiddleware)\<`T`, `C`\> | The middleware function to add. |

#### Returns

`fn`

A function to remove the middleware from the stack.

▸ (): `void`

##### Returns

`void`

#### Defined in

[packages/jsonrpc/src/server.ts:97](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/server.ts#L97)

___

### receiveRequest

▸ **receiveRequest**(`context`, `request`): `Promise`\<`void`\>

Receives a JSON-RPC request and handles it.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `context` | `C` | - |
| `request` | [`JSONRPCRequest`](../interfaces/JSONRPCRequest.md)\<`T`, keyof `T`, [`JSONRPCParams`](../modules.md#jsonrpcparams)\> | The JSON-RPC request object. |

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/jsonrpc/src/server.ts:114](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/server.ts#L114)

___

### registerMethod

▸ **registerMethod**\<`M`\>(`name`, `handler`, `serializer?`): `void`

Registers a method that can be called remotely.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `M` | The method name. |
| `handler` | `MethodHandler`\<`T`, `M`, `C`\> | The function to handle the method call. |
| `serializer?` | [`JSONRPCSerializer`](../interfaces/JSONRPCSerializer.md)\<`T`[`M`][``"params"``], `T`[`M`][``"result"``]\> | Optional serializer for parameters and result. |

#### Returns

`void`

#### Defined in

[packages/jsonrpc/src/server.ts:83](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/server.ts#L83)
