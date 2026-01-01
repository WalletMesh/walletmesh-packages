[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / AdapterContext

# Interface: AdapterContext

Context provided to wallet adapters during installation

## Properties

### appMetadata?

> `optional` **appMetadata**: `object`

Application metadata

#### description?

> `optional` **description**: `string`

#### icons?

> `optional` **icons**: `string`[]

#### name

> **name**: `string`

#### url?

> `optional` **url**: `string`

***

### logger

> **logger**: `object`

Logger instance for debugging

#### debug()

> **debug**(`message`, ...`args`): `void`

##### Parameters

###### message

`string`

###### args

...`unknown`[]

##### Returns

`void`

#### error()

> **error**(`message`, `error?`): `void`

##### Parameters

###### message

`string`

###### error?

`unknown`

##### Returns

`void`

#### info()

> **info**(`message`, ...`args`): `void`

##### Parameters

###### message

`string`

###### args

...`unknown`[]

##### Returns

`void`

#### warn()

> **warn**(`message`, ...`args`): `void`

##### Parameters

###### message

`string`

###### args

...`unknown`[]

##### Returns

`void`
