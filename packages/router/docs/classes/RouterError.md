[**@walletmesh/router v0.2.3**](../README.md)

***

[@walletmesh/router](../globals.md) / RouterError

# Class: RouterError

Custom error class for router errors

## Extends

- `JSONRPCError`

## Constructors

### new RouterError()

> **new RouterError**(`err`, `data`?): [`RouterError`](RouterError.md)

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

#### Defined in

[packages/router/src/errors.ts:28](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/errors.ts#L28)

## Properties

### cause?

> `optional` **cause**: `unknown`

#### Inherited from

`JSONRPCError.cause`

#### Defined in

node\_modules/typescript/lib/lib.es2022.error.d.ts:26

***

### code

> **code**: `number`

The error code.

#### Inherited from

`JSONRPCError.code`

#### Defined in

packages/jsonrpc/dist/error.d.ts:62

***

### data?

> `optional` **data**: `string` \| `Record`\<`string`, `unknown`\>

Additional error data.

#### Inherited from

`JSONRPCError.data`

#### Defined in

packages/jsonrpc/dist/error.d.ts:63

***

### message

> **message**: `string`

#### Inherited from

`JSONRPCError.message`

#### Defined in

node\_modules/typescript/lib/lib.es5.d.ts:1077

***

### name

> **name**: `string` = `'RouterError'`

#### Overrides

`JSONRPCError.name`

#### Defined in

[packages/router/src/errors.ts:21](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/errors.ts#L21)

***

### stack?

> `optional` **stack**: `string`

#### Inherited from

`JSONRPCError.stack`

#### Defined in

node\_modules/typescript/lib/lib.es5.d.ts:1078

***

### prepareStackTrace()?

> `static` `optional` **prepareStackTrace**: (`err`, `stackTraces`) => `any`

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

#### Defined in

node\_modules/@types/node/globals.d.ts:143

***

### stackTraceLimit

> `static` **stackTraceLimit**: `number`

#### Inherited from

`JSONRPCError.stackTraceLimit`

#### Defined in

node\_modules/@types/node/globals.d.ts:145

## Methods

### toString()

> **toString**(): `string`

Returns a string representation of an object.

#### Returns

`string`

#### Inherited from

`JSONRPCError.toString`

#### Defined in

packages/jsonrpc/dist/error.d.ts:89

***

### captureStackTrace()

> `static` **captureStackTrace**(`targetObject`, `constructorOpt`?): `void`

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

#### Defined in

node\_modules/@types/node/globals.d.ts:136
