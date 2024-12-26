[@walletmesh/jsonrpc - v0.1.0](../README.md) / [Exports](../modules.md) / JSONRPCError

# Class: JSONRPCError

JSON-RPC Error class that implements the JSON-RPC 2.0 error object specification.

Standard error codes:
- Parse error (-32700): Invalid JSON was received
- Invalid Request (-32600): The JSON sent is not a valid Request object
- Method not found (-32601): The method does not exist / is not available
- Invalid params (-32602): Invalid method parameter(s)
- Internal error (-32603): Internal JSON-RPC error
- Server error (-32000 to -32099): Implementation-defined server errors

**`Example`**

```typescript
// Basic error
throw new JSONRPCError(-32600, 'Invalid Request');

// Error with additional data
throw new JSONRPCError(
  -32602,
  'Invalid parameters',
  { expected: ['username', 'password'], received: ['username'] }
);
```

## Hierarchy

- `Error`

  ↳ **`JSONRPCError`**

  ↳↳ [`TimeoutError`](TimeoutError.md)

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
| `code` | `number` | The error code (should follow JSON-RPC 2.0 error codes) |
| `message` | `string` | A short, human-readable error message |
| `data?` | `string` \| `Record`\<`string`, `unknown`\> | Optional additional error data for debugging or client handling |

#### Returns

[`JSONRPCError`](JSONRPCError.md)

**`Example`**

```typescript
// Method handler with error handling
peer.registerMethod('divide', (context, { a, b }) => {
  if (b === 0) {
    throw new JSONRPCError(
      -32602,
      'Division by zero',
      { method: 'divide', params: { a, b } }
    );
  }
  return a / b;
});
```

#### Overrides

Error.constructor

#### Defined in

[packages/jsonrpc/src/error.ts:52](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/error.ts#L52)

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

The error code (should follow JSON-RPC 2.0 error codes)

#### Implementation of

[JSONRPCErrorInterface](../interfaces/JSONRPCErrorInterface.md).[code](../interfaces/JSONRPCErrorInterface.md#code)

#### Defined in

[packages/jsonrpc/src/error.ts:53](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/error.ts#L53)

___

### data

• `Optional` **data**: `string` \| `Record`\<`string`, `unknown`\>

Optional additional error data for debugging or client handling

#### Implementation of

[JSONRPCErrorInterface](../interfaces/JSONRPCErrorInterface.md).[data](../interfaces/JSONRPCErrorInterface.md#data)

#### Defined in

[packages/jsonrpc/src/error.ts:55](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/error.ts#L55)

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

[packages/jsonrpc/src/error.ts:28](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/error.ts#L28)

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

[packages/jsonrpc/src/error.ts:60](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/error.ts#L60)

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
