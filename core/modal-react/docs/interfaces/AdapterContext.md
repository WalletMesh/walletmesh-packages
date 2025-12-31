[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AdapterContext

# Interface: AdapterContext

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:51

Context provided to wallet adapters during installation

## Properties

### appMetadata?

> `optional` **appMetadata**: `object`

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:60

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

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:53

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
