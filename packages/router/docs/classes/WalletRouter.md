[**@walletmesh/router v0.2.0**](../README.md)

***

[@walletmesh/router](../globals.md) / WalletRouter

# Class: WalletRouter

Multi-chain router for managing wallet connections with bi-directional communication.
Routes JSON-RPC requests to appropriate wallet instances based on chain ID and
forwards wallet events back to connected clients.

## Extends

- `JSONRPCNode`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md), [`RouterEventMap`](../interfaces/RouterEventMap.md), [`RouterContext`](../interfaces/RouterContext.md)\>

## Constructors

### new WalletRouter()

> **new WalletRouter**(`transport`, `wallets`, `permissionCallback`, `permissionApprovalCallback`, `sessionStore`): [`WalletRouter`](WalletRouter.md)

Creates a new WalletRouter instance for managing multi-chain wallet connections.

#### Parameters

##### transport

###### send

(`message`) => `Promise`\<`void`\>

##### wallets

[`Wallets`](../type-aliases/Wallets.md)

##### permissionCallback

[`PermissionCallback`](../type-aliases/PermissionCallback.md)

##### permissionApprovalCallback

[`PermissionApprovalCallback`](../type-aliases/PermissionApprovalCallback.md)

##### sessionStore

[`SessionStore`](../interfaces/SessionStore.md) = `defaultStore`

#### Returns

[`WalletRouter`](WalletRouter.md)

#### Overrides

`JSONRPCNode<RouterMethodMap, RouterEventMap, RouterContext>.constructor`

#### Defined in

[packages/router/src/router.ts:39](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/router.ts#L39)

## Properties

### context

> `readonly` **context**: [`RouterContext`](../interfaces/RouterContext.md)

#### Inherited from

`JSONRPCNode.context`

#### Defined in

packages/jsonrpc/dist/node.d.ts:40

***

### sessionStore

> `protected` **sessionStore**: [`SessionStore`](../interfaces/SessionStore.md)

#### Defined in

[packages/router/src/router.ts:26](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/router.ts#L26)

## Methods

### \_call()

> `protected` **\_call**(`client`, `methodCall`): `Promise`\<`unknown`\>

Internal helper to execute a method call on a wallet

#### Parameters

##### client

[`WalletClient`](../interfaces/WalletClient.md)

##### methodCall

[`MethodCall`](../interfaces/MethodCall.md)

#### Returns

`Promise`\<`unknown`\>

#### Defined in

[packages/router/src/router.ts:328](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/router.ts#L328)

***

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

packages/jsonrpc/dist/node.d.ts:199

***

### addWallet()

> **addWallet**(`chainId`, `wallet`): `void`

Adds a new wallet client for a specific chain ID.

#### Parameters

##### chainId

`string`

##### wallet

[`WalletClient`](../interfaces/WalletClient.md)

#### Returns

`void`

#### Defined in

[packages/router/src/router.ts:84](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/router.ts#L84)

***

### bulkCall()

> `protected` **bulkCall**(`_context`, `params`): `Promise`\<`unknown`[]\>

Handles wm_bulkCall method

#### Parameters

##### \_context

[`RouterContext`](../interfaces/RouterContext.md)

##### params

[`BulkCallParams`](../interfaces/BulkCallParams.md)

#### Returns

`Promise`\<`unknown`[]\>

#### Defined in

[packages/router/src/router.ts:359](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/router.ts#L359)

***

### call()

> `protected` **call**(`_context`, `params`): `Promise`\<`unknown`\>

Handles wm_call method

#### Parameters

##### \_context

[`RouterContext`](../interfaces/RouterContext.md)

##### params

[`CallParams`](../interfaces/CallParams.md)

#### Returns

`Promise`\<`unknown`\>

#### Defined in

[packages/router/src/router.ts:347](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/router.ts#L347)

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

packages/jsonrpc/dist/node.d.ts:137

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

packages/jsonrpc/dist/node.d.ts:239

***

### connect()

> `protected` **connect**(`context`, `params`): `Promise`\<\{ `permissions`: [`ChainPermissions`](../type-aliases/ChainPermissions.md); `sessionId`: `string`; \}\>

Handles wm_connect method

#### Parameters

##### context

[`RouterContext`](../interfaces/RouterContext.md)

##### params

###### permissions

[`ChainPermissions`](../type-aliases/ChainPermissions.md)

#### Returns

`Promise`\<\{ `permissions`: [`ChainPermissions`](../type-aliases/ChainPermissions.md); `sessionId`: `string`; \}\>

#### Defined in

[packages/router/src/router.ts:131](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/router.ts#L131)

***

### disconnect()

> `protected` **disconnect**(`context`, `params`): `Promise`\<`boolean`\>

Handles wm_disconnect method

#### Parameters

##### context

[`RouterContext`](../interfaces/RouterContext.md)

##### params

###### sessionId

`string`

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[packages/router/src/router.ts:244](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/router.ts#L244)

***

### emit()

> **emit**\<`K`\>(`event`, `params`): `void`

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

`void`

#### Example

```typescript
node.emit('statusUpdate', { status: 'online' });
```

#### Inherited from

`JSONRPCNode.emit`

#### Defined in

packages/jsonrpc/dist/node.d.ts:179

***

### getPermissions()

> `protected` **getPermissions**(`context`, `params`): `Promise`\<[`ChainPermissions`](../type-aliases/ChainPermissions.md)\>

Handles wm_getPermissions method

#### Parameters

##### context

[`RouterContext`](../interfaces/RouterContext.md)

##### params

###### chainIds

`string`[]

###### sessionId

`string`

#### Returns

`Promise`\<[`ChainPermissions`](../type-aliases/ChainPermissions.md)\>

#### Defined in

[packages/router/src/router.ts:280](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/router.ts#L280)

***

### getSupportedMethods()

> `protected` **getSupportedMethods**(`_context`, `params`): `Promise`\<`Record`\<`string`, `string`[]\>\>

Handles wm_getSupportedMethods method

#### Parameters

##### \_context

[`RouterContext`](../interfaces/RouterContext.md)

##### params

###### chainIds

`string`[]

#### Returns

`Promise`\<`Record`\<`string`, `string`[]\>\>

#### Defined in

[packages/router/src/router.ts:387](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/router.ts#L387)

***

### notify()

> **notify**\<`M`\>(`method`, `params`): `void`

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

`void`

#### Example

```typescript
node.notify('log', { message: 'User action performed' });
```

#### Inherited from

`JSONRPCNode.notify`

#### Defined in

packages/jsonrpc/dist/node.d.ts:149

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

packages/jsonrpc/dist/node.d.ts:167

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

packages/jsonrpc/dist/node.d.ts:207

***

### reconnect()

> `protected` **reconnect**(`context`, `params`): `Promise`\<\{ `permissions`: [`ChainPermissions`](../type-aliases/ChainPermissions.md); `status`: `boolean`; \}\>

Handles wm_reconnect method

#### Parameters

##### context

[`RouterContext`](../interfaces/RouterContext.md)

##### params

###### sessionId

`string`

#### Returns

`Promise`\<\{ `permissions`: [`ChainPermissions`](../type-aliases/ChainPermissions.md); `status`: `boolean`; \}\>

#### Defined in

[packages/router/src/router.ts:217](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/router.ts#L217)

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

packages/jsonrpc/dist/node.d.ts:89

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

packages/jsonrpc/dist/node.d.ts:111

***

### removeWallet()

> **removeWallet**(`chainId`): `void`

Removes a wallet client for a specific chain ID.

#### Parameters

##### chainId

`string`

#### Returns

`void`

#### Defined in

[packages/router/src/router.ts:106](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/router.ts#L106)

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

packages/jsonrpc/dist/node.d.ts:230

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

### setupWalletEventListeners()

> `protected` **setupWalletEventListeners**(`wallets`): `void`

Sets up event listeners for all wallet clients

#### Parameters

##### wallets

[`Wallets`](../type-aliases/Wallets.md)

#### Returns

`void`

#### Defined in

[packages/router/src/router.ts:171](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/router.ts#L171)

***

### updatePermissions()

> `protected` **updatePermissions**(`context`, `params`): `Promise`\<[`ChainPermissions`](../type-aliases/ChainPermissions.md)\>

Handles wm_updatePermissions method

#### Parameters

##### context

[`RouterContext`](../interfaces/RouterContext.md)

##### params

###### permissions

[`ChainPermissions`](../type-aliases/ChainPermissions.md)

###### sessionId

`string`

#### Returns

`Promise`\<[`ChainPermissions`](../type-aliases/ChainPermissions.md)\>

#### Defined in

[packages/router/src/router.ts:306](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/router.ts#L306)

***

### validateChain()

> `protected` **validateChain**(`chainId`): [`WalletClient`](../interfaces/WalletClient.md)

Validates a chain ID and returns its corresponding JSON-RPC client

#### Parameters

##### chainId

`string`

#### Returns

[`WalletClient`](../interfaces/WalletClient.md)

#### Defined in

[packages/router/src/router.ts:73](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/router.ts#L73)
