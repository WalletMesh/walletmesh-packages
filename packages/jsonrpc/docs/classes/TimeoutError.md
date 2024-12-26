[@walletmesh/jsonrpc - v0.1.0](../README.md) / [Exports](../modules.md) / TimeoutError

# Class: TimeoutError

Specialized error class for JSON-RPC request timeouts.
Extends JSONRPCError with a fixed error code (-32000) and includes the request ID.

**`Example`**

```typescript
try {
  // Call method with 5 second timeout
  const result = await peer.callMethod('slowMethod', params, 5);
} catch (error) {
  if (error instanceof TimeoutError) {
    console.error(`Request ${error.id} timed out`);
  }
}
```

## Hierarchy

- [`JSONRPCError`](JSONRPCError.md)

  ↳ **`TimeoutError`**

## Table of contents

### Constructors

- [constructor](TimeoutError.md#constructor)

### Properties

- [cause](TimeoutError.md#cause)
- [code](TimeoutError.md#code)
- [data](TimeoutError.md#data)
- [id](TimeoutError.md#id)
- [message](TimeoutError.md#message)
- [name](TimeoutError.md#name)
- [stack](TimeoutError.md#stack)
- [prepareStackTrace](TimeoutError.md#preparestacktrace)
- [stackTraceLimit](TimeoutError.md#stacktracelimit)

### Methods

- [toString](TimeoutError.md#tostring)
- [captureStackTrace](TimeoutError.md#capturestacktrace)

## Constructors

### constructor

• **new TimeoutError**(`message`, `id`): [`TimeoutError`](TimeoutError.md)

Creates a new TimeoutError instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | A message describing the timeout |
| `id` | [`JSONRPCID`](../modules.md#jsonrpcid) | The ID of the request that timed out |

#### Returns

[`TimeoutError`](TimeoutError.md)

**`Example`**

```typescript
// Inside JSONRPCPeer implementation
if (timeoutInSeconds > 0) {
  timer = setTimeout(() => {
    this.pendingRequests.delete(id);
    reject(new TimeoutError('Request timed out', id));
  }, timeoutInSeconds * 1000);
}
```

#### Overrides

[JSONRPCError](JSONRPCError.md).[constructor](JSONRPCError.md#constructor)

#### Defined in

[packages/jsonrpc/src/error.ts:108](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/error.ts#L108)

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

[JSONRPCError](JSONRPCError.md).[cause](JSONRPCError.md#cause)

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:26

___

### code

• **code**: `number`

The error code (should follow JSON-RPC 2.0 error codes)

#### Inherited from

[JSONRPCError](JSONRPCError.md).[code](JSONRPCError.md#code)

#### Defined in

[packages/jsonrpc/src/error.ts:53](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/error.ts#L53)

___

### data

• `Optional` **data**: `string` \| `Record`\<`string`, `unknown`\>

Optional additional error data for debugging or client handling

#### Inherited from

[JSONRPCError](JSONRPCError.md).[data](JSONRPCError.md#data)

#### Defined in

[packages/jsonrpc/src/error.ts:55](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/error.ts#L55)

___

### id

• **id**: [`JSONRPCID`](../modules.md#jsonrpcid)

The ID of the request that timed out

#### Defined in

[packages/jsonrpc/src/error.ts:110](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/error.ts#L110)

___

### message

• **message**: `string`

The error message.

#### Inherited from

[JSONRPCError](JSONRPCError.md).[message](JSONRPCError.md#message)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1077

___

### name

• **name**: `string` = `'TimeoutError'`

#### Overrides

[JSONRPCError](JSONRPCError.md).[name](JSONRPCError.md#name)

#### Defined in

[packages/jsonrpc/src/error.ts:89](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/error.ts#L89)

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

[JSONRPCError](JSONRPCError.md).[stack](JSONRPCError.md#stack)

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

[JSONRPCError](JSONRPCError.md).[prepareStackTrace](JSONRPCError.md#preparestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:143

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

[JSONRPCError](JSONRPCError.md).[stackTraceLimit](JSONRPCError.md#stacktracelimit)

#### Defined in

node_modules/@types/node/globals.d.ts:145

## Methods

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[JSONRPCError](JSONRPCError.md).[toString](JSONRPCError.md#tostring)

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

[JSONRPCError](JSONRPCError.md).[captureStackTrace](JSONRPCError.md#capturestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:136
