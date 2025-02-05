[**@walletmesh/jsonrpc v0.4.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCNode

# Class: JSONRPCNode\<T, E, C\>

Defined in: [core/jsonrpc/src/node.ts:23](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/node.ts#L23)

## Type Parameters

• **T** *extends* [`JSONRPCMethodMap`](../interfaces/JSONRPCMethodMap.md) = [`JSONRPCMethodMap`](../interfaces/JSONRPCMethodMap.md)

• **E** *extends* [`JSONRPCEventMap`](../interfaces/JSONRPCEventMap.md) = [`JSONRPCEventMap`](../interfaces/JSONRPCEventMap.md)

• **C** *extends* [`JSONRPCContext`](../type-aliases/JSONRPCContext.md) = [`JSONRPCContext`](../type-aliases/JSONRPCContext.md)

## Constructors

### new JSONRPCNode()

> **new JSONRPCNode**\<`T`, `E`, `C`\>(`transport`, `context`): [`JSONRPCNode`](JSONRPCNode.md)\<`T`, `E`, `C`\>

Defined in: [core/jsonrpc/src/node.ts:39](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/node.ts#L39)

#### Parameters

##### transport

[`JSONRPCTransport`](../interfaces/JSONRPCTransport.md)

##### context

`C` = `...`

#### Returns

[`JSONRPCNode`](JSONRPCNode.md)\<`T`, `E`, `C`\>

## Properties

### context

> `readonly` **context**: `C`

Defined in: [core/jsonrpc/src/node.ts:41](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/node.ts#L41)

## Methods

### addMiddleware()

> **addMiddleware**(`middleware`): () => `void`

Defined in: [core/jsonrpc/src/node.ts:132](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/node.ts#L132)

#### Parameters

##### middleware

[`JSONRPCMiddleware`](../type-aliases/JSONRPCMiddleware.md)\<`T`, `C`\>

#### Returns

`Function`

##### Returns

`void`

***

### callMethod()

> **callMethod**\<`M`\>(`method`, `params`?, `timeoutInSeconds`?): `Promise`\<`T`\[`M`\]\[`"result"`\]\>

Defined in: [core/jsonrpc/src/node.ts:69](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/node.ts#L69)

#### Type Parameters

• **M** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### method

`M`

##### params?

`T`\[`M`\]\[`"params"`\]

##### timeoutInSeconds?

`number` = `0`

#### Returns

`Promise`\<`T`\[`M`\]\[`"result"`\]\>

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [core/jsonrpc/src/node.ts:210](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/node.ts#L210)

#### Returns

`Promise`\<`void`\>

***

### emit()

> **emit**\<`K`\>(`event`, `params`): `Promise`\<`void`\>

Defined in: [core/jsonrpc/src/node.ts:123](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/node.ts#L123)

#### Type Parameters

• **K** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### event

`K`

##### params

`E`\[`K`\]

#### Returns

`Promise`\<`void`\>

***

### notify()

> **notify**\<`M`\>(`method`, `params`): `Promise`\<`void`\>

Defined in: [core/jsonrpc/src/node.ts:104](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/node.ts#L104)

#### Type Parameters

• **M** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### method

`M`

##### params

`T`\[`M`\]\[`"params"`\]

#### Returns

`Promise`\<`void`\>

***

### on()

> **on**\<`K`\>(`event`, `handler`): () => `void`

Defined in: [core/jsonrpc/src/node.ts:119](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/node.ts#L119)

#### Type Parameters

• **K** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### event

`K`

##### handler

(`params`) => `void`

#### Returns

`Function`

##### Returns

`void`

***

### receiveMessage()

> **receiveMessage**(`message`): `Promise`\<`void`\>

Defined in: [core/jsonrpc/src/node.ts:136](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/node.ts#L136)

#### Parameters

##### message

`unknown`

#### Returns

`Promise`\<`void`\>

***

### registerMethod()

> **registerMethod**\<`M`\>(`name`, `handler`): `void`

Defined in: [core/jsonrpc/src/node.ts:54](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/node.ts#L54)

#### Type Parameters

• **M** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### name

`Extract`\<`M`, `string`\>

##### handler

(`context`, `params`) => `Promise`\<`T`\[`M`\]\[`"result"`\]\>

#### Returns

`void`

***

### registerSerializer()

> **registerSerializer**\<`M`\>(`method`, `serializer`): `void`

Defined in: [core/jsonrpc/src/node.ts:62](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/node.ts#L62)

#### Type Parameters

• **M** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### method

`M`

##### serializer

[`JSONRPCSerializer`](../interfaces/JSONRPCSerializer.md)\<`T`\[`M`\]\[`"params"`\], `T`\[`M`\]\[`"result"`\]\>

#### Returns

`void`

***

### setFallbackHandler()

> **setFallbackHandler**(`handler`): `void`

Defined in: [core/jsonrpc/src/node.ts:204](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/node.ts#L204)

#### Parameters

##### handler

(`context`, `method`, `params`) => `Promise`\<`unknown`\>

#### Returns

`void`

***

### setFallbackSerializer()

> **setFallbackSerializer**(`serializer`): `void`

Defined in: [core/jsonrpc/src/node.ts:35](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/node.ts#L35)

#### Parameters

##### serializer

[`JSONRPCSerializer`](../interfaces/JSONRPCSerializer.md)\<`unknown`, `unknown`\>

#### Returns

`void`
