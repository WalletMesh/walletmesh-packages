[**@walletmesh/modal v0.0.2**](../README.md)

***

[@walletmesh/modal](../globals.md) / WalletError

# Class: WalletError

Defined in: [core/modal/src/lib/client/types.ts:79](https://github.com/WalletMesh/walletmesh-packages/blob/65bc501d5bed45d0e6d444f53e29595da551d59e/core/modal/src/lib/client/types.ts#L79)

Client-specific error with context

## Extends

- `Error`

## Constructors

### new WalletError()

> **new WalletError**(`message`, `context`, `originalError`?): [`WalletError`](WalletError.md)

Defined in: [core/modal/src/lib/client/types.ts:80](https://github.com/WalletMesh/walletmesh-packages/blob/65bc501d5bed45d0e6d444f53e29595da551d59e/core/modal/src/lib/client/types.ts#L80)

#### Parameters

##### message

`string`

##### context

`"client"` | `"transport"` | `"adapter"` | `"storage"`

##### originalError?

`Error`

#### Returns

[`WalletError`](WalletError.md)

#### Overrides

`Error.constructor`

## Properties

### cause?

> `optional` **cause**: `unknown`

Defined in: node\_modules/typescript/lib/lib.es2022.error.d.ts:26

#### Inherited from

`Error.cause`

***

### context

> `readonly` **context**: `"client"` \| `"transport"` \| `"adapter"` \| `"storage"`

Defined in: [core/modal/src/lib/client/types.ts:82](https://github.com/WalletMesh/walletmesh-packages/blob/65bc501d5bed45d0e6d444f53e29595da551d59e/core/modal/src/lib/client/types.ts#L82)

***

### message

> **message**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1077

#### Inherited from

`Error.message`

***

### name

> **name**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1076

#### Inherited from

`Error.name`

***

### originalError?

> `readonly` `optional` **originalError**: `Error`

Defined in: [core/modal/src/lib/client/types.ts:83](https://github.com/WalletMesh/walletmesh-packages/blob/65bc501d5bed45d0e6d444f53e29595da551d59e/core/modal/src/lib/client/types.ts#L83)

***

### stack?

> `optional` **stack**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1078

#### Inherited from

`Error.stack`

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
