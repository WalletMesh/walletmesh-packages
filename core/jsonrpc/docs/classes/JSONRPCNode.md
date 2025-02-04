[**@walletmesh/jsonrpc v0.3.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCNode

# Class: JSONRPCNode\<T, E, C\>

Defined in: [core/jsonrpc/src/node.ts:59](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/node.ts#L59)

Core class implementing the JSON-RPC 2.0 protocol with bi-directional communication support.
Provides a high-level interface for JSON-RPC communication while managing all the underlying complexity.

## Example

```typescript
// Define method and event types
type Methods = {
  add: {
    params: { a: number; b: number };
    result: number;
  };
};

type Events = {
  userJoined: { username: string };
};

// Create node instance
const node = new JSONRPCNode<Methods, Events>({
  send: message => ws.send(JSON.stringify(message))
});

// Register method handler
node.registerMethod('add', (context, { a, b }) => a + b);

// Listen for events
node.on('userJoined', ({ username }) => {
  console.log(`${username} joined`);
});
```

## Type Parameters

• **T** *extends* [`JSONRPCMethodMap`](../interfaces/JSONRPCMethodMap.md) = [`JSONRPCMethodMap`](../interfaces/JSONRPCMethodMap.md)

Method map defining available RPC methods and their types

• **E** *extends* [`JSONRPCEventMap`](../interfaces/JSONRPCEventMap.md) = [`JSONRPCEventMap`](../interfaces/JSONRPCEventMap.md)

Event map defining available events and their payload types

• **C** *extends* [`JSONRPCContext`](../type-aliases/JSONRPCContext.md) = [`JSONRPCContext`](../type-aliases/JSONRPCContext.md)

Context type shared between middleware and method handlers

## Constructors

### new JSONRPCNode()

> **new JSONRPCNode**\<`T`, `E`, `C`\>(`transport`, `context`): [`JSONRPCNode`](JSONRPCNode.md)\<`T`, `E`, `C`\>

Defined in: [core/jsonrpc/src/node.ts:101](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/node.ts#L101)

Creates a new JSONRPCNode instance.

#### Parameters

##### transport

[`JSONRPCTransport`](../interfaces/JSONRPCTransport.md)

Transport object that handles sending messages between nodes

##### context

`C` = `...`

Optional context object shared between middleware and method handlers

#### Returns

[`JSONRPCNode`](JSONRPCNode.md)\<`T`, `E`, `C`\>

## Properties

### context

> `readonly` **context**: `C`

Defined in: [core/jsonrpc/src/node.ts:103](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/node.ts#L103)

Optional context object shared between middleware and method handlers

## Methods

### addMiddleware()

> **addMiddleware**(`middleware`): () => `void`

Defined in: [core/jsonrpc/src/node.ts:298](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/node.ts#L298)

Adds a middleware function to the middleware stack.

#### Parameters

##### middleware

[`JSONRPCMiddleware`](../type-aliases/JSONRPCMiddleware.md)\<`T`, `C`\>

Middleware function that can intercept/modify requests

#### Returns

`Function`

Cleanup function that removes the middleware

##### Returns

`void`

#### Example

```typescript
const cleanup = node.addMiddleware(async (context, request, next) => {
  console.log('Request:', request);
  const response = await next();
  console.log('Response:', response);
  return response;
});

// Later: remove middleware
cleanup();
```

***

### callMethod()

> **callMethod**\<`M`\>(`method`, `params`?, `timeoutInSeconds`?): `Promise`\<`T`\[`M`\]\[`"result"`\]\>

Defined in: [core/jsonrpc/src/node.ts:190](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/node.ts#L190)

Calls a remote method and returns a promise for the result.

#### Type Parameters

• **M** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### method

`M`

The name of the method to call

##### params?

`T`\[`M`\]\[`"params"`\]

Parameters to pass to the method

##### timeoutInSeconds?

`number` = `0`

Optional timeout in seconds (0 for no timeout)

#### Returns

`Promise`\<`T`\[`M`\]\[`"result"`\]\>

Promise that resolves with the method result

#### Throws

If the remote method throws an error

#### Throws

If the call times out

#### Example

```typescript
// Simple call
const sum = await node.callMethod('add', { a: 1, b: 2 });

// Call with timeout
try {
  const result = await node.callMethod('slowMethod', { data: 'test' }, 5);
} catch (error) {
  if (error instanceof TimeoutError) {
    console.error('Request timed out');
  }
}
```

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [core/jsonrpc/src/node.ts:417](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/node.ts#L417)

Closes the node, cleaning up all event handlers, middleware, and pending requests.

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await node.close();
```

***

### emit()

> **emit**\<`K`\>(`event`, `params`): `Promise`\<`void`\>

Defined in: [core/jsonrpc/src/node.ts:270](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/node.ts#L270)

Emits an event to the remote node.

#### Type Parameters

• **K** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### event

`K`

The name of the event to emit

##### params

`E`\[`K`\]

Event payload

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
node.emit('statusUpdate', { status: 'online' });
```

***

### notify()

> **notify**\<`M`\>(`method`, `params`): `Promise`\<`void`\>

Defined in: [core/jsonrpc/src/node.ts:226](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/node.ts#L226)

Sends a notification (a request without expecting a response).

#### Type Parameters

• **M** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### method

`M`

The name of the method to call

##### params

`T`\[`M`\]\[`"params"`\]

Parameters to pass to the method

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
node.notify('log', { message: 'User action performed' });
```

***

### on()

> **on**\<`K`\>(`event`, `handler`): () => `void`

Defined in: [core/jsonrpc/src/node.ts:255](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/node.ts#L255)

Registers an event handler for the specified event type.

#### Type Parameters

• **K** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### event

`K`

The name of the event to listen for

##### handler

(`params`) => `void`

Function that handles the event

#### Returns

`Function`

Cleanup function that removes the event handler

##### Returns

`void`

#### Example

```typescript
const cleanup = node.on('userJoined', ({ username }) => {
  console.log(`${username} joined`);
});

// Later: remove handler
cleanup();
```

***

### receiveMessage()

> **receiveMessage**(`message`): `Promise`\<`void`\>

Defined in: [core/jsonrpc/src/node.ts:309](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/node.ts#L309)

Processes an incoming JSON-RPC message.
This method handles requests, responses, notifications, and events.

#### Parameters

##### message

`unknown`

The received message to process

#### Returns

`Promise`\<`void`\>

#### Throws

If the message is invalid

***

### registerMethod()

> **registerMethod**\<`M`\>(`name`, `handler`): `void`

Defined in: [core/jsonrpc/src/node.ts:129](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/node.ts#L129)

Registers a method handler for the specified method name.

#### Type Parameters

• **M** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### name

`Extract`\<`M`, `string`\>

The name of the method to register

##### handler

(`context`, `params`) => `Promise`\<`T`\[`M`\]\[`"result"`\]\>

Function that handles method calls

#### Returns

`void`

#### Example

```typescript
// Register a method
node.registerMethod('add', (context, { a, b }) => a + b);
```

***

### registerSerializer()

> **registerSerializer**\<`M`\>(`method`, `serializer`): `void`

Defined in: [core/jsonrpc/src/node.ts:158](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/node.ts#L158)

Registers a serializer for parameters and results.

#### Type Parameters

• **M** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### method

`M`

The name to register the serializer under

##### serializer

[`JSONRPCSerializer`](../interfaces/JSONRPCSerializer.md)\<`T`\[`M`\]\[`"params"`\], `T`\[`M`\]\[`"result"`\]\>

The serializer implementation

#### Returns

`void`

#### Example

```typescript
// Register Date serializer
node.registerSerializer('processDate', {
  params: {
    serialize: (date, method) => ({ serialized: date.toISOString(), method }),
    deserialize: (data, method) => new Date(data.serialized)
  },
  result: {
    serialize: (date, method) => ({ serialized: date.toISOString(), method }),
    deserialize: (data, method) => new Date(data.serialized)
  }
});
```

***

### setFallbackHandler()

> **setFallbackHandler**(`handler`): `void`

Defined in: [core/jsonrpc/src/node.ts:402](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/node.ts#L402)

Sets a fallback handler for unregistered methods.
The fallback handler will be called when a method is not found.
Like registerMethod, the handler is wrapped to provide consistent error handling
and response formatting.

#### Parameters

##### handler

(`context`, `method`, `params`) => `Promise`\<`unknown`\>

Function that handles unknown method calls

#### Returns

`void`

#### Example

```typescript
node.setFallbackHandler(async (context, method, params) => {
  console.log(`Unknown method called: ${method}`);
  // Simply throw an error or return a value
  throw new Error(`Method ${method} is not supported`);
  // Or handle it by forwarding to another RPC server
  return await otherServer.callMethod(method, params);
});
```

***

### setFallbackSerializer()

> **setFallbackSerializer**(`serializer`): `void`

Defined in: [core/jsonrpc/src/node.ts:91](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/node.ts#L91)

Sets a fallback serializer to be used when no method-specific serializer is provided.

#### Parameters

##### serializer

[`JSONRPCSerializer`](../interfaces/JSONRPCSerializer.md)\<`unknown`, `unknown`\>

The serializer to use as fallback

#### Returns

`void`

#### Example

```typescript
// Set a fallback serializer for handling dates
node.setFallbackSerializer({
  params: {
    serialize: (value, method) => ({ serialized: value instanceof Date ? value.toISOString() : String(value), method }),
    deserialize: (data, method) => new Date(data.serialized)
  },
  result: {
    serialize: (value, method) => ({ serialized: value instanceof Date ? value.toISOString() : String(value), method }),
    deserialize: (data, method) => new Date(data.serialized)
  }
});
```
