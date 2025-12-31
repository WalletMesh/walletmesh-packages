[**@walletmesh/jsonrpc v0.5.4**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCNode

# Class: JSONRPCNode\<T, E, C\>

Defined in: [core/jsonrpc/src/node.ts:70](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/node.ts#L70)

Represents a JSON-RPC 2.0 node capable of bi-directional communication.
It can register methods, handle incoming requests, send requests,
emit and listen for events, and manage middleware.

The node interacts with a transport layer (defined by [JSONRPCTransport](../interfaces/JSONRPCTransport.md))
for sending and receiving messages. It automatically hooks into the transport's
`onMessage` callback to process incoming messages.

## Example

```typescript
// Define method and event maps
type MyMethods = {
  add: { params: { a: number, b: number }, result: number };
};
type MyEvents = {
  updated: { value: string };
};
type MyContext = { userId?: string };

// Implement a transport (e.g., using WebSockets)
const transport: JSONRPCTransport = {
  send: async (message) => { websocket.send(JSON.stringify(message)); },
  onMessage: (callback) => {
    websocket.onmessage = (event) => callback(JSON.parse(event.data as string));
  }
};

// Create and configure the node
const node = new JSONRPCNode<MyMethods, MyEvents, MyContext>(transport, { customContextValue: 123 });

node.registerMethod('add', async (context, params) => {
  console.log('Context:', context.userId, context.customContextValue);
  return params.a + params.b;
});

node.on('updated', (payload) => console.log('Event received:', payload.value));

// To send requests or emit events:
// const sum = await node.callMethod('add', { a: 1, b: 2 });
// await node.emit('updated', { value: 'new data' });
```

## Type Parameters

### T

`T` *extends* [`JSONRPCMethodMap`](../interfaces/JSONRPCMethodMap.md) = [`JSONRPCMethodMap`](../interfaces/JSONRPCMethodMap.md)

A map defining the available RPC methods, their parameters, and result types.

### E

`E` *extends* [`JSONRPCEventMap`](../interfaces/JSONRPCEventMap.md) = [`JSONRPCEventMap`](../interfaces/JSONRPCEventMap.md)

A map defining the available events and their payload types.

### C

`C` *extends* [`JSONRPCContext`](../type-aliases/JSONRPCContext.md) = [`JSONRPCContext`](../type-aliases/JSONRPCContext.md)

A context type shared across method handlers and middleware.

## Constructors

### Constructor

> **new JSONRPCNode**\<`T`, `E`, `C`\>(`transport`, `context`): `JSONRPCNode`\<`T`, `E`, `C`\>

Defined in: [core/jsonrpc/src/node.ts:90](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/node.ts#L90)

Creates an instance of JSONRPCNode.

#### Parameters

##### transport

[`JSONRPCTransport`](../interfaces/JSONRPCTransport.md)

The transport mechanism for sending and receiving messages.
                   The node will automatically subscribe to `transport.onMessage`.

##### context

`C` = `...`

An optional initial context object to be passed to middleware and method handlers.
                 Defaults to an empty object.

#### Returns

`JSONRPCNode`\<`T`, `E`, `C`\>

## Properties

### context

> `readonly` **context**: `C`

Defined in: [core/jsonrpc/src/node.ts:92](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/node.ts#L92)

An optional initial context object to be passed to middleware and method handlers.
                 Defaults to an empty object.

## Methods

### addMiddleware()

> **addMiddleware**(`middleware`): () => `void`

Defined in: [core/jsonrpc/src/node.ts:317](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/node.ts#L317)

Adds a middleware function to the pre-deserialization request processing chain.
Pre-deserialization middleware runs BEFORE params are deserialized, so it sees raw/serialized params.
This is the default behavior for backward compatibility with existing middleware.

#### Parameters

##### middleware

[`JSONRPCMiddleware`](../type-aliases/JSONRPCMiddleware.md)\<`T`, `C`\>

The middleware function to add.

#### Returns

A function that, when called, will remove this middleware.

> (): `void`

##### Returns

`void`

***

### addPostDeserializationMiddleware()

> **addPostDeserializationMiddleware**(`middleware`): () => `void`

Defined in: [core/jsonrpc/src/node.ts:329](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/node.ts#L329)

Adds a middleware function to the post-deserialization request processing chain.
Post-deserialization middleware runs AFTER params are deserialized, so it sees typed domain objects.
Use this when your middleware needs to work with the actual deserialized parameter types.

#### Parameters

##### middleware

[`JSONRPCMiddleware`](../type-aliases/JSONRPCMiddleware.md)\<`T`, `C`\>

The middleware function to add.

#### Returns

A function that, when called, will remove this middleware.

> (): `void`

##### Returns

`void`

***

### callMethod()

> **callMethod**\<`M`\>(`method`, `params?`, `timeoutInSeconds?`): `Promise`\<`T`\[`M`\]\[`"result"`\]\>

Defined in: [core/jsonrpc/src/node.ts:195](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/node.ts#L195)

Calls a remote JSON-RPC method.

#### Type Parameters

##### M

`M` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### method

`M`

The name of the method to call.

##### params?

`T`\[`M`\]\[`"params"`\]

The parameters for the method call.

##### timeoutInSeconds?

`number` = `0`

Optional timeout for the request in seconds. Defaults to 0 (no timeout).

#### Returns

`Promise`\<`T`\[`M`\]\[`"result"`\]\>

A promise that resolves with the result of the method call.

#### Throws

If the request times out.

#### Throws

If the remote end returns an error.

#### Throws

If sending the request fails.

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [core/jsonrpc/src/node.ts:587](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/node.ts#L587)

Closes the JSON-RPC node, cleaning up resources.
This includes removing all event handlers, middleware, and rejecting any pending requests.
The underlying transport is not closed by this method and should be managed separately.

#### Returns

`Promise`\<`void`\>

***

### emit()

> **emit**\<`K`\>(`event`, `params`): `Promise`\<`void`\>

Defined in: [core/jsonrpc/src/node.ts:280](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/node.ts#L280)

Emits an event to the remote end.

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### event

`K`

The name of the event to emit.

##### params

`E`\[`K`\]

The payload for the event.

#### Returns

`Promise`\<`void`\>

***

### getRegisteredMethods()

> **getRegisteredMethods**(): `string`[]

Defined in: [core/jsonrpc/src/node.ts:437](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/node.ts#L437)

Gets the list of registered method names.
Used for capability discovery following the wm_getSupportedMethods pattern.

#### Returns

`string`[]

Array of registered method names as strings.

***

### notify()

> **notify**\<`M`\>(`method`, `params`): `Promise`\<`void`\>

Defined in: [core/jsonrpc/src/node.ts:253](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/node.ts#L253)

Sends a JSON-RPC notification (a request without an ID, expecting no response).

#### Type Parameters

##### M

`M` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### method

`M`

The name of the method for the notification.

##### params

`T`\[`M`\]\[`"params"`\]

The parameters for the notification.

#### Returns

`Promise`\<`void`\>

***

### on()

> **on**\<`K`\>(`event`, `handler`): () => `void`

Defined in: [core/jsonrpc/src/node.ts:270](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/node.ts#L270)

Registers an event handler for a specific event name.

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### event

`K`

The name of the event to listen for.

##### handler

(`params`) => `void`

The function to call when the event is received. It receives the event payload.

#### Returns

A function that, when called, will remove this event handler.

> (): `void`

##### Returns

`void`

***

### receiveMessage()

> **receiveMessage**(`message`): `Promise`\<`void`\>

Defined in: [core/jsonrpc/src/node.ts:340](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/node.ts#L340)

Processes an incoming message from the transport.
This method is typically called by the transport's `onMessage` handler.
It validates the message and routes it to the appropriate handler (request, response, or event).

#### Parameters

##### message

`unknown`

The raw message received from the transport.

#### Returns

`Promise`\<`void`\>

***

### registerMethod()

> **registerMethod**\<`M`\>(`name`, `handler`): `void`

Defined in: [core/jsonrpc/src/node.ts:163](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/node.ts#L163)

Registers a method handler for a given method name.

#### Type Parameters

##### M

`M` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### name

`Extract`\<`M`, `string`\>

The name of the method to register.

##### handler

(`context`, `params`) => `Promise`\<`T`\[`M`\]\[`"result"`\]\>

The asynchronous function to handle requests for this method.
                 It receives the context and method parameters, and should return the result.

#### Returns

`void`

***

### registerSerializer()

> **registerSerializer**\<`M`\>(`method`, `serializer`): `void`

Defined in: [core/jsonrpc/src/node.ts:177](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/node.ts#L177)

Registers a custom serializer for the parameters and/or result of a specific method.

#### Type Parameters

##### M

`M` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### method

`M`

The name of the method for which to register the serializer.

##### serializer

[`JSONRPCSerializer`](../interfaces/JSONRPCSerializer.md)\<`T`\[`M`\]\[`"params"`\], `T`\[`M`\]\[`"result"`\]\>

The serializer implementation for the method's parameters and/or result.

#### Returns

`void`

***

### sendNotification()

> `protected` **sendNotification**(`method`, `params?`): `Promise`\<`void`\>

Defined in: [core/jsonrpc/src/node.ts:296](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/node.ts#L296)

Send a JSON-RPC notification (request without id) to the remote endpoint.

#### Parameters

##### method

`string`

Method name of the notification

##### params?

[`JSONRPCParams`](../type-aliases/JSONRPCParams.md)

Optional parameters payload

#### Returns

`Promise`\<`void`\>

***

### setFallbackHandler()

> **setFallbackHandler**(`handler`): `void`

Defined in: [core/jsonrpc/src/node.ts:425](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/node.ts#L425)

Sets a fallback handler for methods that are not explicitly registered.
This handler will be invoked if a request is received for a method name
that does not have a registered handler. The provided handler should return
the direct result of the operation, which will be wrapped into a MethodResponse.

#### Parameters

##### handler

(`context`, `method`, `params`) => `Promise`\<`unknown`\>

The asynchronous function to handle fallback requests.
                 It receives the context, method name, and parameters, and should
                 return a Promise resolving to the method's result.

#### Returns

`void`
