[**@walletmesh/jsonrpc v0.1.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCError

# Class: JSONRPCError

JSON-RPC Error class that implements the JSON-RPC 2.0 error object specification.

Standard error codes:
- Parse error (-32700): Invalid JSON was received
- Invalid Request (-32600): The JSON sent is not a valid Request object
- Method not found (-32601): The method does not exist / is not available
- Invalid params (-32602): Invalid method parameter(s)
- Internal error (-32603): Internal JSON-RPC error
- Server error (-32000 to -32099): Implementation-defined server errors

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

[packages/jsonrpc/src/error.ts:52](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/error.ts#L52)

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

[packages/jsonrpc/src/error.ts:53](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/error.ts#L53)

***

### data?

> `optional` **data**: `string` \| `Record`\<`string`, `unknown`\>

Optional additional error data for debugging or client handling

#### Implementation of

[`JSONRPCErrorInterface`](../interfaces/JSONRPCErrorInterface.md).[`data`](../interfaces/JSONRPCErrorInterface.md#data)

#### Defined in

[packages/jsonrpc/src/error.ts:55](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/error.ts#L55)

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

[packages/jsonrpc/src/error.ts:28](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/error.ts#L28)

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

[packages/jsonrpc/src/error.ts:60](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/error.ts#L60)

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
