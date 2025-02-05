[**@walletmesh/aztec-rpc-wallet v0.3.0**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecWalletError

# Class: AztecWalletError

Defined in: [aztec/rpc-wallet/src/errors.ts:61](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/errors.ts#L61)

Custom error class for Aztec Wallet RPC errors.

## Extends

- `JSONRPCError`

## Constructors

### new AztecWalletError()

> **new AztecWalletError**(`err`, `data`?): [`AztecWalletError`](AztecWalletError.md)

Defined in: [aztec/rpc-wallet/src/errors.ts:67](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/errors.ts#L67)

Creates a new AztecWalletError.

#### Parameters

##### err

`AztecWalletErrorType`

The error type from AztecWalletErrorMap

##### data?

`string`

Optional additional error data

#### Returns

[`AztecWalletError`](AztecWalletError.md)

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

> **name**: `string`

Defined in: core/jsonrpc/dist/error.d.ts:64

#### Inherited from

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
