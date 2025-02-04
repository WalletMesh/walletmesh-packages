[**@walletmesh/jsonrpc v0.3.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / TimeoutError

# Class: TimeoutError

Defined in: [core/jsonrpc/src/error.ts:153](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/error.ts#L153)

Specialized error class for JSON-RPC request timeouts.
Extends JSONRPCError with a fixed error code (-32000) and includes the request ID.
Uses the first server error code (-32000) to indicate timeout conditions while
staying within the JSON-RPC 2.0 specification's error code ranges.

Common timeout scenarios:
- Network latency causing slow responses
- Long-running operations that exceed timeout
- Lost or dropped connections
- Remote node unresponsive

## Example

```typescript
// Setting timeouts on method calls
try {
  // Call method with 5 second timeout
  const result = await peer.callMethod('slowMethod', params, 5);
} catch (error) {
  if (error instanceof TimeoutError) {
    console.error(`Request ${error.id} timed out`);
    // Handle timeout (retry, fallback, etc.)
  }
}

// Implementing timeouts in method handlers
peer.registerMethod('longOperation', async (context, params) => {
  const timeoutMs = 5000;
  try {
    const result = await Promise.race([
      performOperation(params),
      new Promise((_, reject) =>
        setTimeout(() => reject(new TimeoutError('Operation timed out')), timeoutMs)
      )
    ]);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof TimeoutError) {
      throw error;
    }
    throw new JSONRPCError(-32603, 'Operation failed');
  }
});
```

## Extends

- [`JSONRPCError`](JSONRPCError.md)

## Constructors

### new TimeoutError()

> **new TimeoutError**(`message`, `id`): [`TimeoutError`](TimeoutError.md)

Defined in: [core/jsonrpc/src/error.ts:174](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/error.ts#L174)

Creates a new TimeoutError instance.

#### Parameters

##### message

`string`

A message describing the timeout (e.g., "Request timed out after 5 seconds")

##### id

[`JSONRPCID`](../type-aliases/JSONRPCID.md)

The ID of the request that timed out (used for correlation with the original request)

#### Returns

[`TimeoutError`](TimeoutError.md)

#### Throws

If message is not a string

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

## Properties

### cause?

> `optional` **cause**: `unknown`

Defined in: node\_modules/typescript/lib/lib.es2022.error.d.ts:26

#### Inherited from

[`JSONRPCError`](JSONRPCError.md).[`cause`](JSONRPCError.md#cause)

***

### code

> **code**: `number`

Defined in: [core/jsonrpc/src/error.ts:89](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/error.ts#L89)

The error code (should follow JSON-RPC 2.0 error codes)

#### Inherited from

[`JSONRPCError`](JSONRPCError.md).[`code`](JSONRPCError.md#code-1)

***

### data?

> `optional` **data**: `string` \| `Record`\<`string`, `unknown`\>

Defined in: [core/jsonrpc/src/error.ts:91](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/error.ts#L91)

Optional additional error data for debugging or client handling

#### Inherited from

[`JSONRPCError`](JSONRPCError.md).[`data`](JSONRPCError.md#data-1)

***

### id

> **id**: [`JSONRPCID`](../type-aliases/JSONRPCID.md)

Defined in: [core/jsonrpc/src/error.ts:176](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/error.ts#L176)

The ID of the request that timed out (used for correlation with the original request)

***

### message

> **message**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1077

The error message.

#### Inherited from

[`JSONRPCError`](JSONRPCError.md).[`message`](JSONRPCError.md#message-1)

***

### name

> **name**: `string` = `'TimeoutError'`

Defined in: [core/jsonrpc/src/error.ts:154](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/error.ts#L154)

#### Overrides

[`JSONRPCError`](JSONRPCError.md).[`name`](JSONRPCError.md#name)

***

### stack?

> `optional` **stack**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1078

#### Inherited from

[`JSONRPCError`](JSONRPCError.md).[`stack`](JSONRPCError.md#stack)

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

[`JSONRPCError`](JSONRPCError.md).[`prepareStackTrace`](JSONRPCError.md#preparestacktrace)

***

### stackTraceLimit

> `static` **stackTraceLimit**: `number`

Defined in: node\_modules/@types/node/globals.d.ts:145

#### Inherited from

[`JSONRPCError`](JSONRPCError.md).[`stackTraceLimit`](JSONRPCError.md#stacktracelimit)

## Methods

### toString()

> **toString**(): `string`

Defined in: [core/jsonrpc/src/error.ts:96](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/error.ts#L96)

Returns a string representation of an object.

#### Returns

`string`

#### Inherited from

[`JSONRPCError`](JSONRPCError.md).[`toString`](JSONRPCError.md#tostring)

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

[`JSONRPCError`](JSONRPCError.md).[`captureStackTrace`](JSONRPCError.md#capturestacktrace)
