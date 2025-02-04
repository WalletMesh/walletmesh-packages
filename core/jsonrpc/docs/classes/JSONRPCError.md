[**@walletmesh/jsonrpc v0.2.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCError

# Class: JSONRPCError

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

#### Defined in

[packages/jsonrpc/src/error.ts:88](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/error.ts#L88)

## Properties

### cause?

> `optional` **cause**: `unknown`

#### Inherited from

`Error.cause`

#### Defined in

node\_modules/typescript/lib/lib.es2022.error.d.ts:26

***

### code

> **code**: `number`

The error code (should follow JSON-RPC 2.0 error codes)

#### Implementation of

[`JSONRPCErrorInterface`](../interfaces/JSONRPCErrorInterface.md).[`code`](../interfaces/JSONRPCErrorInterface.md#code)

#### Defined in

[packages/jsonrpc/src/error.ts:89](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/error.ts#L89)

***

### data?

> `optional` **data**: `string` \| `Record`\<`string`, `unknown`\>

Optional additional error data for debugging or client handling

#### Implementation of

[`JSONRPCErrorInterface`](../interfaces/JSONRPCErrorInterface.md).[`data`](../interfaces/JSONRPCErrorInterface.md#data)

#### Defined in

[packages/jsonrpc/src/error.ts:91](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/error.ts#L91)

***

### message

> **message**: `string`

The error message.

#### Implementation of

[`JSONRPCErrorInterface`](../interfaces/JSONRPCErrorInterface.md).[`message`](../interfaces/JSONRPCErrorInterface.md#message)

#### Inherited from

`Error.message`

#### Defined in

node\_modules/typescript/lib/lib.es5.d.ts:1077

***

### name

> **name**: `string` = `'JSONRPCError'`

#### Overrides

`Error.name`

#### Defined in

[packages/jsonrpc/src/error.ts:63](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/error.ts#L63)

***

### stack?

> `optional` **stack**: `string`

#### Inherited from

`Error.stack`

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

`Error.prepareStackTrace`

#### Defined in

node\_modules/@types/node/globals.d.ts:143

***

### stackTraceLimit

> `static` **stackTraceLimit**: `number`

#### Inherited from

`Error.stackTraceLimit`

#### Defined in

node\_modules/@types/node/globals.d.ts:145

## Methods

### toString()

> **toString**(): `string`

Returns a string representation of an object.

#### Returns

`string`

#### Defined in

[packages/jsonrpc/src/error.ts:96](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/error.ts#L96)

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

`Error.captureStackTrace`

#### Defined in

node\_modules/@types/node/globals.d.ts:136
