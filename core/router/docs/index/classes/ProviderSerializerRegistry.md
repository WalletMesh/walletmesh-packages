[**@walletmesh/router v0.5.4**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / ProviderSerializerRegistry

# Class: ProviderSerializerRegistry

Defined in: [core/router/src/provider-serialization.ts:18](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/provider-serialization.ts#L18)

Registry for method-specific serializers in the router provider.
This allows registering serializers for the actual wallet methods
(e.g., aztec_getAddress) rather than the wrapper method (wm_call).

## Constructors

### Constructor

> **new ProviderSerializerRegistry**(): `ProviderSerializerRegistry`

#### Returns

`ProviderSerializerRegistry`

## Methods

### deserializeResult()

> **deserializeResult**(`method`, `result`): `Promise`\<`unknown`\>

Defined in: [core/router/src/provider-serialization.ts:63](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/provider-serialization.ts#L63)

Deserialize a result from a method call

#### Parameters

##### method

`string`

##### result

`unknown`

#### Returns

`Promise`\<`unknown`\>

***

### get()

> **get**(`method`): `undefined` \| `JSONRPCSerializer`\<`unknown`, `unknown`\>

Defined in: [core/router/src/provider-serialization.ts:31](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/provider-serialization.ts#L31)

Get a serializer for a method, if registered

#### Parameters

##### method

`string`

#### Returns

`undefined` \| `JSONRPCSerializer`\<`unknown`, `unknown`\>

***

### has()

> **has**(`method`): `boolean`

Defined in: [core/router/src/provider-serialization.ts:38](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/provider-serialization.ts#L38)

Check if a method has a registered serializer

#### Parameters

##### method

`string`

#### Returns

`boolean`

***

### register()

> **register**\<`P`, `R`\>(`method`, `serializer`): `void`

Defined in: [core/router/src/provider-serialization.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/provider-serialization.ts#L24)

Register a serializer for a specific method

#### Type Parameters

##### P

`P`

##### R

`R`

#### Parameters

##### method

`string`

##### serializer

`JSONRPCSerializer`\<`P`, `R`\>

#### Returns

`void`

***

### serializeCall()

> **serializeCall**(`call`): `Promise`\<[`SerializedMethodCall`](../interfaces/SerializedMethodCall.md)\>

Defined in: [core/router/src/provider-serialization.ts:45](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/provider-serialization.ts#L45)

Serialize a method call (including its parameters)

#### Parameters

##### call

[`MethodCall`](../interfaces/MethodCall.md)\<`string`\>

#### Returns

`Promise`\<[`SerializedMethodCall`](../interfaces/SerializedMethodCall.md)\>
