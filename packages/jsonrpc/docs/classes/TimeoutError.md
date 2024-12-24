[@walletmesh/jsonrpc - v0.0.5](../README.md) / [Exports](../modules.md) / TimeoutError

# Class: TimeoutError

TimeoutError class for sending errors when a request times out.

## Hierarchy

- `Error`

  ↳ **`TimeoutError`**

## Table of contents

### Constructors

- [constructor](TimeoutError.md#constructor)

### Properties

- [cause](TimeoutError.md#cause)
- [id](TimeoutError.md#id)
- [message](TimeoutError.md#message)
- [name](TimeoutError.md#name)
- [stack](TimeoutError.md#stack)
- [prepareStackTrace](TimeoutError.md#preparestacktrace)
- [stackTraceLimit](TimeoutError.md#stacktracelimit)

### Methods

- [captureStackTrace](TimeoutError.md#capturestacktrace)

## Constructors

### constructor

• **new TimeoutError**(`message`, `id`): [`TimeoutError`](TimeoutError.md)

Creates a new TimeoutError instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | The error message. |
| `id` | [`JSONRPCID`](../modules.md#jsonrpcid) | The request ID. |

#### Returns

[`TimeoutError`](TimeoutError.md)

#### Overrides

Error.constructor

#### Defined in

[packages/jsonrpc/src/client.ts:21](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/client.ts#L21)

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

Error.cause

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:26

___

### id

• **id**: [`JSONRPCID`](../modules.md#jsonrpcid)

The request ID.

#### Defined in

[packages/jsonrpc/src/client.ts:23](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/client.ts#L23)

___

### message

• **message**: `string`

#### Inherited from

Error.message

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1077

___

### name

• **name**: `string`

#### Inherited from

Error.name

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1076

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

Error.stack

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

Error.prepareStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:143

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

Error.stackTraceLimit

#### Defined in

node_modules/@types/node/globals.d.ts:145

## Methods

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

Error.captureStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:136
