[**@walletmesh/jsonrpc v0.4.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCError

# Class: JSONRPCError

Defined in: [core/jsonrpc/src/error.ts:62](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/error.ts#L62)

JSON-RPC Error class that implements the JSON-RPC 2.0 error object specification.
Provides structured error handling with standard error codes and optional additional data.

Standard error codes (as per JSON-RPC 2.0 spec):
- Parse error (-32700): Invalid JSON received by the server
  - Used when the JSON string cannot be parsed
  - Example: Malformed JSON syntax

- Invalid Request (-32600): The JSON sent is not a valid Request object
  - Used when the request structure is invalid
  - Example: Missing required fields, wrong version

- Method not found (-32601): The requested method does not exist or is unavailable
  - Used when the method name is not registered
  - Example: Calling an unregistered method

- Invalid params (-32602): Method parameters are invalid
  - Used when parameters don't match the method's expectations
  - Example: Wrong types, missing required params

- Internal error (-32603): Internal JSON-RPC error
  - Used for unexpected server conditions
  - Example: Database connection failure

- Server error (-32000 to -32099): Reserved for implementation-defined server errors
  - TimeoutError uses -32000 (see TimeoutError class)
  - Other codes in this range can be used for custom server errors
  - Example: Rate limiting, validation errors

## Example

```typescript
// Basic error
throw new JSONRPCError(-32600, 'Invalid Request');

// Error with additional data
throw new JSONRPCError(
  -32602,
  'Invalid parameters',
  { expected: ['username', 'password'], received: ['username'] }
);

// Error handling pattern
try {
  const result = await validateAndProcess(request);
  return { success: true, data: result };
} catch (error) {
  if (error instanceof JSONRPCError) {
    throw error; // Re-throw JSON-RPC errors
  }
  // Wrap other errors as Internal error
  throw new JSONRPCError(
    -32603,
    'Internal error',
    error instanceof Error ? error.message : 'Unknown error'
  );
}
```

## Extends

- `Error`

## Extended by

- [`TimeoutError`](TimeoutError.md)

## Implements

- [`JSONRPCErrorInterface`](../interfaces/JSONRPCErrorInterface.md)

## Constructors

### new JSONRPCError()

> **new JSONRPCError**(`code`, `message`, `data`?): [`JSONRPCError`](JSONRPCError.md)

Defined in: [core/jsonrpc/src/error.ts:88](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/error.ts#L88)

Creates a new JSONRPCError instance.

#### Parameters

##### code

`number`

The error code (should follow JSON-RPC 2.0 error codes)

##### message

`string`

A short, human-readable error message

##### data?

Optional additional error data for debugging or client handling

`string` | `Record`\<`string`, `unknown`\>

#### Returns

[`JSONRPCError`](JSONRPCError.md)

#### Throws

If code is not a number or message is not a string

#### Example

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

`Error.constructor`

## Properties

### cause?

> `optional` **cause**: `unknown`

Defined in: node\_modules/typescript/lib/lib.es2022.error.d.ts:26

#### Inherited from

`Error.cause`

***

### code

> **code**: `number`

Defined in: [core/jsonrpc/src/error.ts:89](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/error.ts#L89)

The error code (should follow JSON-RPC 2.0 error codes)

#### Implementation of

[`JSONRPCErrorInterface`](../interfaces/JSONRPCErrorInterface.md).[`code`](../interfaces/JSONRPCErrorInterface.md#code)

***

### data?

> `optional` **data**: `string` \| `Record`\<`string`, `unknown`\>

Defined in: [core/jsonrpc/src/error.ts:91](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/error.ts#L91)

Optional additional error data for debugging or client handling

#### Implementation of

[`JSONRPCErrorInterface`](../interfaces/JSONRPCErrorInterface.md).[`data`](../interfaces/JSONRPCErrorInterface.md#data)

***

### message

> **message**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1077

The error message.

#### Implementation of

[`JSONRPCErrorInterface`](../interfaces/JSONRPCErrorInterface.md).[`message`](../interfaces/JSONRPCErrorInterface.md#message)

#### Inherited from

`Error.message`

***

### name

> **name**: `string` = `'JSONRPCError'`

Defined in: [core/jsonrpc/src/error.ts:63](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/error.ts#L63)

#### Overrides

`Error.name`

***

### stack?

> `optional` **stack**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1078

#### Inherited from

`Error.stack`

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

## Methods

### toString()

> **toString**(): `string`

Defined in: [core/jsonrpc/src/error.ts:96](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/error.ts#L96)

Returns a string representation of an object.

#### Returns

`string`

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

`Error.captureStackTrace`
