[**@walletmesh/router v0.3.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / RouterError

# Class: RouterError

Defined in: [core/router/src/errors.ts:20](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/errors.ts#L20)

Custom error class for router errors

## Extends

- `JSONRPCError`

## Constructors

### new RouterError()

> **new RouterError**(`err`, `data`?): [`RouterError`](RouterError.md)

Defined in: [core/router/src/errors.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/errors.ts#L28)

Creates a new RouterError.

#### Parameters

##### err

The error type from RouterErrorMap

`"unknownChain"` | `"invalidSession"` | `"insufficientPermissions"` | `"methodNotSupported"` | `"walletNotAvailable"` | `"partialFailure"` | `"invalidRequest"` | `"unknownError"`

##### data?

Optional additional error data

`string` | `Record`\<`string`, `unknown`\>

#### Returns

[`RouterError`](RouterError.md)

#### Overrides

`JSONRPCError.constructor`

## Properties

### cause?

> `optional` **cause**: `unknown`

Defined in: node\_modules/typescript/lib/lib.es2022.error.d.ts:26

#### Inherited from

`JSONRPCError.cause`

***

### code

> **code**: `number`

Defined in: core/jsonrpc/dist/error.d.ts:62

The error code.

#### Inherited from

`JSONRPCError.code`

***

### data?

> `optional` **data**: `string` \| `Record`\<`string`, `unknown`\>

Defined in: core/jsonrpc/dist/error.d.ts:63

Additional error data.

#### Inherited from

`JSONRPCError.data`

***

### message

> **message**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1077

#### Inherited from

`JSONRPCError.message`

***

### name

> **name**: `string` = `'RouterError'`

Defined in: [core/router/src/errors.ts:21](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/errors.ts#L21)

#### Overrides

`JSONRPCError.name`

***

### stack?

> `optional` **stack**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1078

#### Inherited from

`JSONRPCError.stack`

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

`JSONRPCError.prepareStackTrace`

***

### stackTraceLimit

> `static` **stackTraceLimit**: `number`

Defined in: node\_modules/@types/node/globals.d.ts:145

#### Inherited from

`JSONRPCError.stackTraceLimit`

## Methods

### toString()

> **toString**(): `string`

Defined in: core/jsonrpc/dist/error.d.ts:89

Returns a string representation of an object.

#### Returns

`string`

#### Inherited from

`JSONRPCError.toString`

***

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

`JSONRPCError.captureStackTrace`
