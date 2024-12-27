[**@walletmesh/jsonrpc v0.1.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / TimeoutError

# Class: TimeoutError

Specialized error class for JSON-RPC request timeouts.
Extends JSONRPCError with a fixed error code (-32000) and includes the request ID.

## Example

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

## Extends

- [`JSONRPCError`](JSONRPCError.md)

## Constructors

### new TimeoutError()

> **new TimeoutError**(`message`, `id`): [`TimeoutError`](TimeoutError.md)

Creates a new TimeoutError instance.

#### Parameters

##### message

`string`

A message describing the timeout

##### id

[`JSONRPCID`](../type-aliases/JSONRPCID.md)

The ID of the request that timed out

#### Returns

[`TimeoutError`](TimeoutError.md)

#### Example

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

[`JSONRPCError`](JSONRPCError.md).[`constructor`](JSONRPCError.md#constructors)

#### Defined in

[packages/jsonrpc/src/error.ts:108](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/error.ts#L108)

## Properties

### cause?

> `optional` **cause**: `unknown`

#### Inherited from

[`JSONRPCError`](JSONRPCError.md).[`cause`](JSONRPCError.md#cause)

#### Defined in

node\_modules/typescript/lib/lib.es2022.error.d.ts:26

***

### code

> **code**: `number`

The error code (should follow JSON-RPC 2.0 error codes)

#### Inherited from

[`JSONRPCError`](JSONRPCError.md).[`code`](JSONRPCError.md#code-1)

#### Defined in

[packages/jsonrpc/src/error.ts:53](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/error.ts#L53)

***

### data?

> `optional` **data**: `string` \| `Record`\<`string`, `unknown`\>

Optional additional error data for debugging or client handling

#### Inherited from

[`JSONRPCError`](JSONRPCError.md).[`data`](JSONRPCError.md#data-1)

#### Defined in

[packages/jsonrpc/src/error.ts:55](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/error.ts#L55)

***

### id

> **id**: [`JSONRPCID`](../type-aliases/JSONRPCID.md)

The ID of the request that timed out

#### Defined in

[packages/jsonrpc/src/error.ts:110](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/error.ts#L110)

***

### message

> **message**: `string`

The error message.

#### Inherited from

[`JSONRPCError`](JSONRPCError.md).[`message`](JSONRPCError.md#message-1)

#### Defined in

node\_modules/typescript/lib/lib.es5.d.ts:1077

***

### name

> **name**: `string` = `'TimeoutError'`

#### Overrides

[`JSONRPCError`](JSONRPCError.md).[`name`](JSONRPCError.md#name)

#### Defined in

[packages/jsonrpc/src/error.ts:89](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/error.ts#L89)

***

### stack?

> `optional` **stack**: `string`

#### Inherited from

[`JSONRPCError`](JSONRPCError.md).[`stack`](JSONRPCError.md#stack)

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

[`JSONRPCError`](JSONRPCError.md).[`prepareStackTrace`](JSONRPCError.md#preparestacktrace)

#### Defined in

node\_modules/@types/node/globals.d.ts:143

***

### stackTraceLimit

> `static` **stackTraceLimit**: `number`

#### Inherited from

[`JSONRPCError`](JSONRPCError.md).[`stackTraceLimit`](JSONRPCError.md#stacktracelimit)

#### Defined in

node\_modules/@types/node/globals.d.ts:145

## Methods

### toString()

> **toString**(): `string`

Returns a string representation of an object.

#### Returns

`string`

#### Inherited from

[`JSONRPCError`](JSONRPCError.md).[`toString`](JSONRPCError.md#tostring)

#### Defined in

[packages/jsonrpc/src/error.ts:60](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/error.ts#L60)

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

[`JSONRPCError`](JSONRPCError.md).[`captureStackTrace`](JSONRPCError.md#capturestacktrace)

#### Defined in

node\_modules/@types/node/globals.d.ts:136
