[**@walletmesh/router v0.2.3**](../README.md)

***

[@walletmesh/router](../globals.md) / WalletRouterProvider

# Class: WalletRouterProvider

## Extends

- `JSONRPCNode`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md), [`RouterEventMap`](../interfaces/RouterEventMap.md), [`RouterContext`](../interfaces/RouterContext.md)\>

## Constructors

### new WalletRouterProvider()

> **new WalletRouterProvider**(`transport`, `context`?): [`WalletRouterProvider`](WalletRouterProvider.md)

Creates a new JSONRPCNode instance.

#### Parameters

##### transport

`JSONRPCTransport`

Transport object that handles sending messages between nodes

##### context?

[`RouterContext`](../interfaces/RouterContext.md)

Optional context object shared between middleware and method handlers

#### Returns

[`WalletRouterProvider`](WalletRouterProvider.md)

#### Inherited from

`JSONRPCNode<RouterMethodMap, RouterEventMap, RouterContext>.constructor`

#### Defined in

packages/jsonrpc/dist/node.d.ts:74

## Properties

### context

> `readonly` **context**: [`RouterContext`](../interfaces/RouterContext.md)

#### Inherited from

`JSONRPCNode.context`

#### Defined in

packages/jsonrpc/dist/node.d.ts:40

## Accessors

### sessionId

#### Get Signature

> **get** **sessionId**(): `undefined` \| `string`

Gets the current session ID if connected, undefined otherwise.
The session ID is required for most operations and is set after
a successful connection.

##### See

 - [connect](WalletRouterProvider.md#connect) for establishing a session
 - [disconnect](WalletRouterProvider.md#disconnect) for ending a session

##### Returns

`undefined` \| `string`

The current session ID or undefined if not connected

#### Defined in

[packages/router/src/provider.ts:67](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/provider.ts#L67)

## Methods

### addMiddleware()

> **addMiddleware**(`middleware`): () => `void`

Adds a middleware function to the middleware stack.

#### Parameters

##### middleware

`JSONRPCMiddleware`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md), [`RouterContext`](../interfaces/RouterContext.md)\>

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

#### Inherited from

`JSONRPCNode.addMiddleware`

#### Defined in

packages/jsonrpc/dist/node.d.ts:197

***

### bulkCall()

> **bulkCall**(`chainId`, `calls`, `timeout`?): `Promise`\<`unknown`[]\>

Executes multiple method calls in sequence on the same chain.
More efficient than multiple individual calls for related operations.

#### Parameters

##### chainId

`string`

Target chain identifier (must match the chain ID used to connect)

##### calls

[`MethodCall`](../interfaces/MethodCall.md)[]

Array of method calls to execute

##### timeout?

`number`

Optional timeout in milliseconds. If the request takes longer,
                it will be cancelled and throw a TimeoutError

#### Returns

`Promise`\<`unknown`[]\>

Array of results from the wallet method calls

#### Throws

With code 'invalidSession' if not connected

#### Throws

With code 'unknownChain' if chain ID is invalid

#### Throws

With code 'insufficientPermissions' if any method not permitted

#### Throws

With code 'partialFailure' if some calls succeed but others fail

#### Throws

If the request times out

#### See

[\['wm\_bulkCall'\]](../interfaces/RouterMethodMap.md) for detailed request/response types

#### Example

```typescript
// Get accounts and balance in one request
const [accounts, balance] = await provider.bulkCall('eip155:1', [
  { method: 'eth_accounts' },
  {
    method: 'eth_getBalance',
    params: ['0x...', 'latest']
  }
]);
```

#### Defined in

[packages/router/src/provider.ts:264](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/provider.ts#L264)

***

### call()

> **call**(`chainId`, `call`, `timeout`?): `Promise`\<`unknown`\>

Invokes a method on the connected wallet.
Routes the call to the appropriate wallet client based on chain ID.

#### Parameters

##### chainId

`string`

Target chain identifier (must match the chain ID used to connect)

##### call

[`MethodCall`](../interfaces/MethodCall.md)

Method call details including name and parameters

##### timeout?

`number`

Optional timeout in milliseconds. If the request takes longer,
                it will be cancelled and throw a TimeoutError

#### Returns

`Promise`\<`unknown`\>

Result from the wallet method call

#### Throws

With code 'invalidSession' if not connected

#### Throws

With code 'unknownChain' if chain ID is invalid

#### Throws

With code 'insufficientPermissions' if method not permitted

#### Throws

With code 'methodNotSupported' if method not supported

#### Throws

If the request times out

#### See

[\['wm\_call'\]](../interfaces/RouterMethodMap.md) for detailed request/response types

#### Example

```typescript
// Get accounts
const accounts = await provider.call('eip155:1', {
  method: 'eth_accounts'
});

// Send transaction
const txHash = await provider.call('eip155:1', {
  method: 'eth_sendTransaction',
  params: [{
    to: '0x...',
    value: '0x...'
  }]
});
```

#### Defined in

[packages/router/src/provider.ts:224](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/provider.ts#L224)

***

### callMethod()

> **callMethod**\<`M`\>(`method`, `params`?, `timeoutInSeconds`?): `Promise`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

Calls a remote method and returns a promise for the result.

#### Type Parameters

• **M** *extends* keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)

#### Parameters

##### method

`M`

The name of the method to call

##### params?

[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"params"`\]

Parameters to pass to the method

##### timeoutInSeconds?

`number`

Optional timeout in seconds (0 for no timeout)

#### Returns

`Promise`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

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

#### Inherited from

`JSONRPCNode.callMethod`

#### Defined in

packages/jsonrpc/dist/node.d.ts:135

***

### close()

> **close**(): `Promise`\<`void`\>

Closes the node, cleaning up all event handlers, middleware, and pending requests.

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await node.close();
```

#### Inherited from

`JSONRPCNode.close`

#### Defined in

packages/jsonrpc/dist/node.d.ts:237

***

### connect()

> **connect**(`permissions`, `timeout`?): `Promise`\<\{ `permissions`: [`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md); `sessionId`: `string`; \}\>

Connects to multiple chains with specified permissions.
Establishes a session and requests method permissions for each chain.

#### Parameters

##### permissions

[`ChainPermissions`](../type-aliases/ChainPermissions.md)

Map of chain IDs to their requested permissions

##### timeout?

`number`

Optional timeout in milliseconds. If the request takes longer,
                it will be cancelled and throw a TimeoutError

#### Returns

`Promise`\<\{ `permissions`: [`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md); `sessionId`: `string`; \}\>

Session ID that can be used for future requests

#### Throws

With code 'invalidRequest' if permissions are invalid

#### Throws

With code 'unknownChain' if a chain is not supported

#### Throws

If the request times out

#### See

[\['wm\_connect'\]](../interfaces/RouterMethodMap.md) for detailed request/response types

#### Example

```typescript
// Connect to multiple chains with specific permissions
const { sessionId, permissions } = await provider.connect({
  'eip155:1': ['eth_accounts', 'eth_sendTransaction'],
  'eip155:137': ['eth_getBalance', 'eth_call']
});

// Connect with a 5 second timeout
const { sessionId, permissions } = await provider.connect({
  'eip155:1': ['eth_accounts']
}, 5000);
```

#### Defined in

[packages/router/src/provider.ts:98](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/provider.ts#L98)

***

### disconnect()

> **disconnect**(`timeout`?): `Promise`\<`void`\>

Disconnects the current session if one exists.
Cleans up session state and notifies the router to terminate the session.

#### Parameters

##### timeout?

`number`

Optional timeout in milliseconds. If the request takes longer,
                it will be cancelled and throw a TimeoutError

#### Returns

`Promise`\<`void`\>

#### Throws

With code 'invalidSession' if not connected

#### Throws

If the request times out

#### See

[\['wm\_disconnect'\]](../interfaces/RouterMethodMap.md) for detailed request/response types

#### Defined in

[packages/router/src/provider.ts:117](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/provider.ts#L117)

***

### emit()

> **emit**\<`K`\>(`event`, `params`): `Promise`\<`void`\>

Emits an event to the remote node.

#### Type Parameters

• **K** *extends* keyof [`RouterEventMap`](../interfaces/RouterEventMap.md)

#### Parameters

##### event

`K`

The name of the event to emit

##### params

[`RouterEventMap`](../interfaces/RouterEventMap.md)\[`K`\]

Event payload

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
node.emit('statusUpdate', { status: 'online' });
```

#### Inherited from

`JSONRPCNode.emit`

#### Defined in

packages/jsonrpc/dist/node.d.ts:177

***

### getPermissions()

> **getPermissions**(`chainIds`?, `timeout`?): `Promise`\<[`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)\>

Gets current session permissions.
Returns a human-readable format suitable for displaying to users.

#### Parameters

##### chainIds?

`string`[]

Optional array of chain IDs to get permissions for. If not provided, returns permissions for all chains

##### timeout?

`number`

Optional timeout in milliseconds. If the request takes longer,
                it will be cancelled and throw a TimeoutError

#### Returns

`Promise`\<[`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)\>

Record of chain IDs to their permissions with human-readable descriptions

#### Throws

With code 'invalidSession' if not connected

#### Throws

If the request times out

#### See

 - [HumanReadableChainPermissions](../type-aliases/HumanReadableChainPermissions.md) for return type details
 - [\['wm\_getPermissions'\]](../interfaces/RouterMethodMap.md) for detailed request/response types

#### Defined in

[packages/router/src/provider.ts:138](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/provider.ts#L138)

***

### getSupportedMethods()

> **getSupportedMethods**(`chainIds`?, `timeout`?): `Promise`\<`Record`\<`string`, `string`[]\>\>

Gets supported methods for one or more chains.
Used for capability discovery and feature detection.

#### Parameters

##### chainIds?

`string`[]

Optional array of chain identifiers. If not provided, returns router's supported methods

##### timeout?

`number`

Optional timeout in milliseconds. If the request takes longer,
                it will be cancelled and throw a TimeoutError

#### Returns

`Promise`\<`Record`\<`string`, `string`[]\>\>

Record mapping chain IDs to their supported methods

#### Throws

With code 'unknownChain' if any chain ID is invalid

#### Throws

With code 'walletNotAvailable' if wallet capability check fails

#### Throws

If the request times out

#### See

[\['wm\_getSupportedMethods'\]](../interfaces/RouterMethodMap.md) for detailed request/response types

#### Example

```typescript
// Get methods for multiple chains
const methods = await provider.getSupportedMethods(['eip155:1', 'eip155:137']);
if (methods['eip155:1'].includes('eth_signMessage')) {
  // Ethereum mainnet wallet supports message signing
}

// Get router's supported methods
const routerMethods = await provider.getSupportedMethods();
```

#### Defined in

[packages/router/src/provider.ts:301](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/provider.ts#L301)

***

### notify()

> **notify**\<`M`\>(`method`, `params`): `Promise`\<`void`\>

Sends a notification (a request without expecting a response).

#### Type Parameters

• **M** *extends* keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)

#### Parameters

##### method

`M`

The name of the method to call

##### params

[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"params"`\]

Parameters to pass to the method

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
node.notify('log', { message: 'User action performed' });
```

#### Inherited from

`JSONRPCNode.notify`

#### Defined in

packages/jsonrpc/dist/node.d.ts:147

***

### on()

> **on**\<`K`\>(`event`, `handler`): () => `void`

Registers an event handler for the specified event type.

#### Type Parameters

• **K** *extends* keyof [`RouterEventMap`](../interfaces/RouterEventMap.md)

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

#### Inherited from

`JSONRPCNode.on`

#### Defined in

packages/jsonrpc/dist/node.d.ts:165

***

### receiveMessage()

> **receiveMessage**(`message`): `Promise`\<`void`\>

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

#### Inherited from

`JSONRPCNode.receiveMessage`

#### Defined in

packages/jsonrpc/dist/node.d.ts:205

***

### registerMethod()

> **registerMethod**\<`M`\>(`name`, `handler`): `void`

Registers a method handler for the specified method name.

#### Type Parameters

• **M** *extends* keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)

#### Parameters

##### name

`Extract`\<`M`, `string`\>

The name of the method to register

##### handler

(`context`, `params`) => `Promise`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

Function that handles method calls

#### Returns

`void`

#### Example

```typescript
// Register a method
node.registerMethod('add', (context, { a, b }) => a + b);
```

#### Inherited from

`JSONRPCNode.registerMethod`

#### Defined in

packages/jsonrpc/dist/node.d.ts:87

***

### registerSerializer()

> **registerSerializer**\<`M`\>(`method`, `serializer`): `void`

Registers a serializer for parameters and results.

#### Type Parameters

• **M** *extends* keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)

#### Parameters

##### method

`M`

The name to register the serializer under

##### serializer

`JSONRPCSerializer`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"params"`\], [`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

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

#### Inherited from

`JSONRPCNode.registerSerializer`

#### Defined in

packages/jsonrpc/dist/node.d.ts:109

***

### setFallbackHandler()

> **setFallbackHandler**(`handler`): `void`

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

#### Inherited from

`JSONRPCNode.setFallbackHandler`

#### Defined in

packages/jsonrpc/dist/node.d.ts:228

***

### setFallbackSerializer()

> **setFallbackSerializer**(`serializer`): `void`

Sets a fallback serializer to be used when no method-specific serializer is provided.

#### Parameters

##### serializer

`JSONRPCSerializer`\<`unknown`, `unknown`\>

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

#### Inherited from

`JSONRPCNode.setFallbackSerializer`

#### Defined in

packages/jsonrpc/dist/node.d.ts:67

***

### updatePermissions()

> **updatePermissions**(`permissions`, `timeout`?): `Promise`\<[`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)\>

Updates session permissions.
Requests additional permissions or modifies existing ones.

#### Parameters

##### permissions

`Record`\<`string`, `string`[]\>

Record of chain IDs to their new permissions

##### timeout?

`number`

Optional timeout in milliseconds. If the request takes longer,
                it will be cancelled and throw a TimeoutError

#### Returns

`Promise`\<[`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)\>

#### Throws

With code 'invalidSession' if not connected

#### Throws

With code 'invalidRequest' if permissions are invalid

#### Throws

If the request times out

#### See

[\['wm\_updatePermissions'\]](../interfaces/RouterMethodMap.md) for detailed request/response types

#### Example

```typescript
// Update permissions for multiple chains
await provider.updatePermissions({
  'eip155:1': ['eth_accounts', 'eth_sendTransaction'],
  'eip155:137': ['eth_getBalance', 'eth_call']
});
```

#### Defined in

[packages/router/src/provider.ts:172](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/provider.ts#L172)
