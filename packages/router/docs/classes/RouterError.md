[@walletmesh/router - v0.1.0](../README.md) / [Exports](../modules.md) / RouterError

# Class: RouterError

Custom error class for router errors

## Hierarchy

- `JSONRPCError`

  ↳ **`RouterError`**

## Table of contents

### Constructors

- [constructor](RouterError.md#constructor)

### Properties

- [cause](RouterError.md#cause)
- [code](RouterError.md#code)
- [data](RouterError.md#data)
- [message](RouterError.md#message)
- [name](RouterError.md#name)
- [stack](RouterError.md#stack)
- [prepareStackTrace](RouterError.md#preparestacktrace)
- [stackTraceLimit](RouterError.md#stacktracelimit)

### Methods

- [toString](RouterError.md#tostring)
- [captureStackTrace](RouterError.md#capturestacktrace)

## Constructors

### constructor

• **new RouterError**(`err`, `data?`): [`RouterError`](RouterError.md)

Creates a new RouterError.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `err` | ``"unknownChain"`` \| ``"invalidSession"`` \| ``"insufficientPermissions"`` \| ``"methodNotSupported"`` \| ``"walletNotAvailable"`` \| ``"partialFailure"`` \| ``"invalidRequest"`` \| ``"unknownError"`` | The error type from RouterErrorMap |
| `data?` | `string` \| `Record`\<`string`, `unknown`\> | Optional additional error data |

#### Returns

[`RouterError`](RouterError.md)

#### Overrides

JSONRPCError.constructor

#### Defined in

[packages/router/src/errors.ts:28](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/router/src/errors.ts#L28)

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

JSONRPCError.cause

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:26

___

### code

• **code**: `number`

#### Inherited from

JSONRPCError.code

#### Defined in

packages/jsonrpc/dist/error.d.ts:27

___

### data

• `Optional` **data**: `string` \| `Record`\<`string`, `unknown`\>

#### Inherited from

JSONRPCError.data

#### Defined in

packages/jsonrpc/dist/error.d.ts:28

___

### message

• **message**: `string`

#### Inherited from

JSONRPCError.message

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1077

___

### name

• **name**: `string` = `'RouterError'`

#### Overrides

JSONRPCError.name

#### Defined in

[packages/router/src/errors.ts:21](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/router/src/errors.ts#L21)

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

JSONRPCError.stack

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1078

___

### prepareStackTrace

▪ `Static` `Optional` **prepareStackTrace**: (`err`: `Error`, `stackTraces`: `CallSite`[]) => `any`

Optional override for formatting stack traces

**`See`**

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Type declaration

▸ (`err`, `stackTraces`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `err` | `Error` |
| `stackTraces` | `CallSite`[] |

##### Returns

`any`

#### Inherited from

JSONRPCError.prepareStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:143

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

JSONRPCError.stackTraceLimit

#### Defined in

node_modules/@types/node/globals.d.ts:145

## Methods

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

JSONRPCError.toString

#### Defined in

packages/jsonrpc/dist/error.d.ts:53

___

### captureStackTrace

▸ **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Create .stack property on a target object

#### Parameters

| Name | Type |
| :------ | :------ |
| `targetObject` | `object` |
| `constructorOpt?` | `Function` |

#### Returns

`void`

#### Inherited from

JSONRPCError.captureStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:136
