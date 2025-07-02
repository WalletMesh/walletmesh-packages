[**@walletmesh/router v0.5.1**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / ProviderSerializerRegistry

# Class: ProviderSerializerRegistry

Defined in: [core/router/src/provider-serialization.ts:17](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/provider-serialization.ts#L17)

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

Defined in: [core/router/src/provider-serialization.ts:62](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/provider-serialization.ts#L62)

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

Defined in: [core/router/src/provider-serialization.ts:30](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/provider-serialization.ts#L30)

Get a serializer for a method, if registered

#### Parameters

##### method

`string`

#### Returns

`undefined` \| `JSONRPCSerializer`\<`unknown`, `unknown`\>

***

### has()

> **has**(`method`): `boolean`

Defined in: [core/router/src/provider-serialization.ts:37](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/provider-serialization.ts#L37)

Check if a method has a registered serializer

#### Parameters

##### method

`string`

#### Returns

`boolean`

***

### register()

> **register**\<`P`, `R`\>(`method`, `serializer`): `void`

Defined in: [core/router/src/provider-serialization.ts:23](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/provider-serialization.ts#L23)

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

> **serializeCall**(`call`): `Promise`\<`SerializedMethodCall`\>

Defined in: [core/router/src/provider-serialization.ts:44](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/provider-serialization.ts#L44)

Serialize a method call (including its parameters)

#### Parameters

##### call

[`MethodCall`](../interfaces/MethodCall.md)\<`string`\>

#### Returns

`Promise`\<`SerializedMethodCall`\>
