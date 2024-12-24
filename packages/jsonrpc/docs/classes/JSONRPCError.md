[@walletmesh/jsonrpc - v0.0.5](../README.md) / [Exports](../modules.md) / JSONRPCError

# Class: JSONRPCError

JSON-RPC Error class.

Represents an error that can occur during JSON-RPC communication.

## Hierarchy

- `Error`

  ↳ **`JSONRPCError`**

## Implements

- [`JSONRPCErrorInterface`](../interfaces/JSONRPCErrorInterface.md)

## Table of contents

### Constructors

- [constructor](JSONRPCError.md#constructor)

### Properties

- [cause](JSONRPCError.md#cause)
- [code](JSONRPCError.md#code)
- [data](JSONRPCError.md#data)
- [message](JSONRPCError.md#message)
- [name](JSONRPCError.md#name)
- [stack](JSONRPCError.md#stack)
- [prepareStackTrace](JSONRPCError.md#preparestacktrace)
- [stackTraceLimit](JSONRPCError.md#stacktracelimit)

### Methods

- [toString](JSONRPCError.md#tostring)
- [captureStackTrace](JSONRPCError.md#capturestacktrace)

## Constructors

### constructor

• **new JSONRPCError**(`code`, `message`, `data?`): [`JSONRPCError`](JSONRPCError.md)

Creates a new JSONRPCError instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `code` | `number` | The error code. |
| `message` | `string` | The error message. |
| `data?` | `string` \| `Record`\<`string`, `unknown`\> | Additional error data. |

#### Returns

[`JSONRPCError`](JSONRPCError.md)

#### Overrides

Error.constructor

#### Defined in

[packages/jsonrpc/src/error.ts:18](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/error.ts#L18)

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

Error.cause

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:26

___

### code

• **code**: `number`

The error code.

#### Implementation of

[JSONRPCErrorInterface](../interfaces/JSONRPCErrorInterface.md).[code](../interfaces/JSONRPCErrorInterface.md#code)

#### Defined in

[packages/jsonrpc/src/error.ts:19](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/error.ts#L19)

___

### data

• `Optional` **data**: `string` \| `Record`\<`string`, `unknown`\>

Additional error data.

#### Implementation of

[JSONRPCErrorInterface](../interfaces/JSONRPCErrorInterface.md).[data](../interfaces/JSONRPCErrorInterface.md#data)

#### Defined in

[packages/jsonrpc/src/error.ts:21](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/error.ts#L21)

___

### message

• **message**: `string`

The error message.

#### Implementation of

[JSONRPCErrorInterface](../interfaces/JSONRPCErrorInterface.md).[message](../interfaces/JSONRPCErrorInterface.md#message)

#### Inherited from

Error.message

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1077

___

### name

• **name**: `string` = `'JSONRPCError'`

#### Overrides

Error.name

#### Defined in

[packages/jsonrpc/src/error.ts:9](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/error.ts#L9)

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

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[packages/jsonrpc/src/error.ts:26](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/error.ts#L26)

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

Error.captureStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:136
