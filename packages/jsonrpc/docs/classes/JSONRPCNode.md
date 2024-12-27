[**@walletmesh/jsonrpc v0.1.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCNode

# Class: JSONRPCNode\<T, E, C\>

Core class implementing the JSON-RPC 2.0 protocol with bi-directional communication support.

Features:
- Full JSON-RPC 2.0 protocol implementation
- Bi-directional communication (each node can both send and receive)
- Type-safe method and event definitions
- Middleware support for request/response modification
- Custom serialization for complex data types
- Request timeouts
- Event system for broadcast-style communication
- Comprehensive error handling

## Example

```typescript
// Define your types
type MethodMap = {
  add: {
    params: { a: number; b: number };
    result: number;
  };
  getUser: {
    params: { id: string };
    result: User;
  };
};

type EventMap = {
  userJoined: { username: string };
  statusUpdate: { user: string; status: 'online' | 'offline' };
};

type Context = {
  userId?: string;
  isAuthorized?: boolean;
};

// Create a node instance
const node = new JSONRPCNode<MethodMap, EventMap, Context>({
  send: message => websocket.send(JSON.stringify(message))
});

// Register methods
node.registerMethod('add', (context, { a, b }) => a + b);

node.registerMethod('getUser', async (context, { id }) => {
  if (!context.isAuthorized) {
    throw new JSONRPCError(-32600, 'Unauthorized');
  }
  return await db.users.findById(id);
});

// Add middleware
node.addMiddleware(async (context, request, next) => {
  console.log('Request:', request);
  const response = await next();
  console.log('Response:', response);
  return response;
});

// Handle events
node.on('userJoined', ({ username }) => {
  console.log(`${username} joined`);
});

// Call remote methods
try {
  const sum = await node.callMethod('add', { a: 1, b: 2 });
  const user = await node.callMethod('getUser', { id: '123' }, 5);
} catch (error) {
  if (error instanceof TimeoutError) {
    console.error('Request timed out');
  } else if (error instanceof JSONRPCError) {
    console.error('RPC Error:', error.message);
  }
}

// Emit events
node.emit('statusUpdate', {
  user: 'Alice',
  status: 'online'
});
```

## Type Parameters

• **T** *extends* [`JSONRPCMethodMap`](../interfaces/JSONRPCMethodMap.md) = [`JSONRPCMethodMap`](../interfaces/JSONRPCMethodMap.md)

The RPC method map defining available methods

• **E** *extends* [`JSONRPCEventMap`](../interfaces/JSONRPCEventMap.md) = [`JSONRPCEventMap`](../interfaces/JSONRPCEventMap.md)

The event map defining available events

• **C** *extends* [`JSONRPCContext`](../type-aliases/JSONRPCContext.md) = [`JSONRPCContext`](../type-aliases/JSONRPCContext.md)

The context type for method handlers

## Constructors

### new JSONRPCNode()

> **new JSONRPCNode**\<`T`, `E`, `C`\>(`transport`, `context`): [`JSONRPCNode`](JSONRPCNode.md)\<`T`, `E`, `C`\>

#### Parameters

##### transport

[`Transport`](../type-aliases/Transport.md)\<`T`, `E`\>

##### context

`C` = `...`

#### Returns

[`JSONRPCNode`](JSONRPCNode.md)\<`T`, `E`, `C`\>

#### Defined in

[packages/jsonrpc/src/node.ts:250](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/node.ts#L250)

## Properties

### context

> `readonly` **context**: `C`

#### Defined in

[packages/jsonrpc/src/node.ts:252](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/node.ts#L252)

## Methods

### addMiddleware()

> **addMiddleware**(`middleware`): () => `void`

Adds a middleware function to the middleware stack.
Middleware functions are executed in the order they are added,
and can modify both requests and responses.

#### Parameters

##### middleware

[`JSONRPCMiddleware`](../type-aliases/JSONRPCMiddleware.md)\<`T`, `C`\>

The middleware function to add

#### Returns

`Function`

A cleanup function that removes the middleware when called

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

// Later...
cleanup(); // Remove the middleware
```

#### Defined in

[packages/jsonrpc/src/node.ts:510](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/node.ts#L510)

***

### callMethod()

> **callMethod**\<`M`\>(`method`, `params`?, `timeoutInSeconds`?): `Promise`\<`T`\[`M`\]\[`"result"`\]\>

Calls a method on the remote node.

#### Type Parameters

• **M** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### method

`M`

The name of the method to call

##### params?

`T`\[`M`\]\[`"params"`\]

The parameters to pass to the method

##### timeoutInSeconds?

`number` = `0`

Optional timeout in seconds (0 means no timeout)

#### Returns

`Promise`\<`T`\[`M`\]\[`"result"`\]\>

A promise that resolves with the method result

#### Throws

If the method call fails or times out

#### Example

```typescript
try {
  const result = await node.callMethod('add', { a: 1, b: 2 }, 5);
  console.log('Result:', result);
} catch (error) {
  console.error('Error:', error);
}
```

#### Defined in

[packages/jsonrpc/src/node.ts:323](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/node.ts#L323)

***

### emit()

> **emit**\<`K`\>(`event`, `params`): `void`

Emits an event to the remote node.

#### Type Parameters

• **K** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### event

`K`

The name of the event to emit

##### params

`E`\[`K`\]

The event parameters

#### Returns

`void`

#### Example

```typescript
node.emit('statusUpdate', {
  user: 'Alice',
  status: 'online'
});
```

#### Defined in

[packages/jsonrpc/src/node.ts:432](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/node.ts#L432)

***

### notify()

> **notify**\<`M`\>(`method`, `params`): `void`

Sends a notification to the remote node.

#### Type Parameters

• **M** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### method

`M`

The name of the method to call

##### params

`T`\[`M`\]\[`"params"`\]

The parameters to pass to the method

#### Returns

`void`

#### Example

```typescript
node.notify('logMessage', { level: 'info', message: 'Hello' });
```

#### Defined in

[packages/jsonrpc/src/node.ts:373](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/node.ts#L373)

***

### on()

> **on**\<`K`\>(`event`, `handler`): () => `void`

Registers a handler for a specific event type.

#### Type Parameters

• **K** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### event

`K`

The name of the event to handle

##### handler

[`JSONRPCEventHandler`](../type-aliases/JSONRPCEventHandler.md)\<`E`, `K`\>

The function to call when the event is received

#### Returns

`Function`

A cleanup function that removes the event handler when called

##### Returns

`void`

#### Example

```typescript
const cleanup = node.on('userJoined', ({ username }) => {
  console.log(`${username} joined`);
});

// Later...
cleanup(); // Remove the event handler
```

#### Defined in

[packages/jsonrpc/src/node.ts:402](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/node.ts#L402)

***

### receiveMessage()

> **receiveMessage**(`message`): `Promise`\<`void`\>

Handles an incoming message from the remote node.
This should be called whenever a message is received through the transport.

#### Parameters

##### message

`unknown`

The received message

#### Returns

`Promise`\<`void`\>

A promise that resolves when the message has been handled

#### Example

```typescript
websocket.on('message', async (data) => {
  await node.receiveMessage(JSON.parse(data));
});
```

#### Defined in

[packages/jsonrpc/src/node.ts:455](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/node.ts#L455)

***

### registerMethod()

> **registerMethod**\<`M`\>(`name`, `handler`, `serializer`?): `void`

Registers a method that can be called by remote nodes.

#### Type Parameters

• **M** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### name

`M`

The name of the method to register

##### handler

[`MethodHandler`](../type-aliases/MethodHandler.md)\<`T`, `M`, `C`\>

The function that implements the method

##### serializer?

[`JSONRPCSerializer`](../interfaces/JSONRPCSerializer.md)\<`T`\[`M`\]\[`"params"`\], `T`\[`M`\]\[`"result"`\]\>

Optional serializer for method parameters and results

#### Returns

`void`

#### Example

```typescript
node.registerMethod('add', async (context, params) => {
  return params.a + params.b;
});
```

#### Defined in

[packages/jsonrpc/src/node.ts:272](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/node.ts#L272)

***

### registerSerializer()

> **registerSerializer**\<`M`\>(`method`, `serializer`): `void`

Registers a serializer for a remote method.
Used when calling methods that require parameter or result serialization.

#### Type Parameters

• **M** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### method

`M`

The name of the method to register a serializer for

##### serializer

[`JSONRPCSerializer`](../interfaces/JSONRPCSerializer.md)\<`T`\[`M`\]\[`"params"`\], `T`\[`M`\]\[`"result"`\]\>

The serializer implementation

#### Returns

`void`

#### Example

```typescript
node.registerSerializer('processDate', {
  params: {
    serialize: (date) => ({ serialized: date.toISOString() }),
    deserialize: (data) => new Date(data.serialized)
  }
});
```

#### Defined in

[packages/jsonrpc/src/node.ts:297](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/node.ts#L297)
