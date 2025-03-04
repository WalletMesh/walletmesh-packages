[**@walletmesh/modal v0.0.7**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/transports/types](../README.md) / TransportError

# Class: TransportError

Defined in: [core/modal/src/lib/transports/types.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/transports/types.ts#L28)

Transport-specific error class.

## Extends

- `Error`

## Constructors

### new TransportError()

> **new TransportError**(`message`, `type`, `cause`?): [`TransportError`](TransportError.md)

Defined in: [core/modal/src/lib/transports/types.ts:32](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/transports/types.ts#L32)

#### Parameters

##### message

`string`

##### type

[`TransportErrorType`](../type-aliases/TransportErrorType.md)

##### cause?

`Error`

#### Returns

[`TransportError`](TransportError.md)

#### Overrides

`Error.constructor`

## Properties

### name

> **name**: `string` = `'TransportError'`

Defined in: [core/modal/src/lib/transports/types.ts:29](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/transports/types.ts#L29)

#### Overrides

`Error.name`

***

### cause?

> `optional` **cause**: `Error`

Defined in: [core/modal/src/lib/transports/types.ts:30](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/transports/types.ts#L30)

#### Overrides

`Error.cause`

***

### type

> `readonly` **type**: [`TransportErrorType`](../type-aliases/TransportErrorType.md)

Defined in: [core/modal/src/lib/transports/types.ts:34](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/transports/types.ts#L34)

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
