[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/client/types](../README.md) / WalletError

# Class: WalletError

Defined in: [core/modal/src/lib/client/types.ts:13](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L13)

Error class for wallet-related errors.

## Extends

- `Error`

## Constructors

### new WalletError()

> **new WalletError**(`message`, `type`, `cause`?): [`WalletError`](WalletError.md)

Defined in: [core/modal/src/lib/client/types.ts:18](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L18)

#### Parameters

##### message

`string`

##### type

`"client"` | `"connector"` | `"transport"` | `"storage"` | `"timeout"`

##### cause?

`Error`

#### Returns

[`WalletError`](WalletError.md)

#### Overrides

`Error.constructor`

## Properties

### name

> **name**: `string` = `'WalletError'`

Defined in: [core/modal/src/lib/client/types.ts:14](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L14)

#### Overrides

`Error.name`

***

### cause?

> `optional` **cause**: `Error`

Defined in: [core/modal/src/lib/client/types.ts:15](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L15)

#### Overrides

`Error.cause`

***

### type

> `readonly` **type**: `"client"` \| `"connector"` \| `"transport"` \| `"storage"` \| `"timeout"`

Defined in: [core/modal/src/lib/client/types.ts:16](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L16)

***

### prepareStackTrace()?

> `static` `optional` **prepareStackTrace**: (`err`, `stackTraces`) => `any`

Defined in: node\_modules/@types/node/globals.d.ts:143

Optional override for formatting stack traces

#### Parameters

##### err

`Error`

##### stackTraces

`CallSite`[]

#### Returns

`any`

#### See

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Inherited from

`Error.prepareStackTrace`

***

### stackTraceLimit

> `static` **stackTraceLimit**: `number`

Defined in: node\_modules/@types/node/globals.d.ts:145

#### Inherited from

`Error.stackTraceLimit`

***

### message

> **message**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1077

#### Inherited from

`Error.message`

***

### stack?

> `optional` **stack**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1078

#### Inherited from

`Error.stack`

## Methods

### captureStackTrace()

> `static` **captureStackTrace**(`targetObject`, `constructorOpt`?): `void`

Defined in: node\_modules/@types/node/globals.d.ts:136

Create .stack property on a target object

#### Parameters

##### targetObject

`object`

##### constructorOpt?

`Function`

#### Returns

`void`

#### Inherited from

`Error.captureStackTrace`
