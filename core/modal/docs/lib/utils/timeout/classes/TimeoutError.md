[**@walletmesh/modal v0.0.7**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/utils/timeout](../README.md) / TimeoutError

# Class: TimeoutError

Defined in: [core/modal/src/lib/utils/timeout.ts:49](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/utils/timeout.ts#L49)

Specialized error for timeout conditions.

Thrown when a wallet operation fails to complete within
its specified time limit. Includes details about the
operation and duration in the error message.

## Example

```typescript
try {
  await withTimeout(operation, 5000, 'Connect Wallet');
} catch (error) {
  if (error instanceof TimeoutError) {
    console.error('Connection timed out:', error.message);
  }
}
```

## Extends

- `Error`

## Constructors

### new TimeoutError()

> **new TimeoutError**(`operation`, `timeout`): [`TimeoutError`](TimeoutError.md)

Defined in: [core/modal/src/lib/utils/timeout.ts:50](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/utils/timeout.ts#L50)

#### Parameters

##### operation

`string`

##### timeout

`number`

#### Returns

[`TimeoutError`](TimeoutError.md)

#### Overrides

`Error.constructor`

## Properties

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

### cause?

> `optional` **cause**: `unknown`

Defined in: node\_modules/typescript/lib/lib.es2022.error.d.ts:26

#### Inherited from

`Error.cause`

***

### name

> **name**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1076

#### Inherited from

`Error.name`

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
