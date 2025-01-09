[**@walletmesh/router v0.2.5**](../README.md)

***

[@walletmesh/router](../globals.md) / WalletRouter

# Class: WalletRouter

Multi-chain router for managing wallet connections with bi-directional communication.
Routes JSON-RPC requests to appropriate wallet instances based on chain ID and
forwards wallet events back to connected clients.

The router handles:
- Session management and authentication
- Permission management and validation
- Method routing to appropriate wallet clients
- Event forwarding from wallets to clients
- Bulk operation support

## Example

```typescript
// Initialize router with wallets and permission manager
const router = new WalletRouter(
  transport,
  new Map([
    ['eip155:1', ethereumWallet],
    ['solana:mainnet', solanaWallet]
  ]),
  permissionManager,
  sessionStore
);

// Router automatically handles:
// - Session validation
// - Permission checks
// - Method routing
// - Event forwarding
```

## Extends

- `JSONRPCNode`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md), [`RouterEventMap`](../interfaces/RouterEventMap.md), [`RouterContext`](../interfaces/RouterContext.md)\>

## Constructors

### new WalletRouter()

> **new WalletRouter**(`transport`, `wallets`, `permissionManager`, `sessionStore`): [`WalletRouter`](WalletRouter.md)

Creates a new WalletRouter instance for managing multi-chain wallet connections.

#### Parameters

##### transport

`JSONRPCTransport`

Transport layer for sending messages

##### wallets

[`Wallets`](../type-aliases/Wallets.md)

Map of chain IDs to wallet clients

##### permissionManager

[`PermissionManager`](../interfaces/PermissionManager.md)\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md), [`RouterContext`](../interfaces/RouterContext.md)\>

Manager for handling permissions

##### sessionStore

[`SessionStore`](../interfaces/SessionStore.md) = `defaultStore`

Optional store for session persistence (defaults to in-memory store)

#### Returns

[`WalletRouter`](WalletRouter.md)

#### Throws

If transport is invalid or required components are missing

#### Example

```typescript
const router = new WalletRouter(
  { send: async (msg) => window.postMessage(msg, '*') },
  new Map([['eip155:1', ethereumWallet]]),
  new AllowAskDenyManager(askCallback, initialState),
  new LocalStorageSessionStore()
);
```

#### Overrides

`JSONRPCNode<RouterMethodMap, RouterEventMap, RouterContext>.constructor`

#### Defined in

[packages/router/src/router.ts:97](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/router.ts#L97)

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

Store for managing session data persistence and lifecycle

#### Defined in

[packages/router/src/router.ts:56](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/router.ts#L56)

## Methods

### \_call()

> `protected` **\_call**(`client`, `methodCall`): `Promise`\<`unknown`\>

Internal helper to execute a method call on a wallet.
Handles error translation from wallet-specific to router errors.

#### Parameters

##### client

[`WalletClient`](../interfaces/WalletClient.md)

Wallet client to execute method on

##### methodCall

[`MethodCall`](../interfaces/MethodCall.md)

Method call details including name and parameters

#### Returns

`Promise`\<`unknown`\>

Result of the method call

#### Throws

With appropriate error code based on failure type

#### Defined in

[packages/router/src/router.ts:463](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/router.ts#L463)

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

packages/jsonrpc/dist/node.d.ts:197

***

### addWallet()

> **addWallet**(`chainId`, `wallet`): `void`

Adds a new wallet client for a specific chain ID.
Sets up event listeners and emits availability notification.

#### Parameters

##### chainId

`string`

Chain ID to add wallet for

##### wallet

[`WalletClient`](../interfaces/WalletClient.md)

Wallet client implementation

#### Returns

`void`

#### Throws

With code 'invalidRequest' if chain is already configured

#### Example

```typescript
router.addWallet('eip155:137', new JSONRPCWalletClient(
  'https://polygon-rpc.com'
));
```

#### Defined in

[packages/router/src/router.ts:161](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/router.ts#L161)

***

### bulkCall()

> `protected` **bulkCall**(`_context`, `params`): `Promise`\<`unknown`[]\>

Handles wm_bulkCall method to execute multiple wallet methods.
Executes calls in sequence and handles partial failures.

#### Parameters

##### \_context

[`RouterContext`](../interfaces/RouterContext.md)

Router context (unused but required by interface)

##### params

[`BulkCallParams`](../interfaces/BulkCallParams.md)

Parameters including chain ID and array of method calls

#### Returns

`Promise`\<`unknown`[]\>

Array of results corresponding to each method call

#### Throws

With code 'partialFailure' if some calls succeed

#### Defined in

[packages/router/src/router.ts:510](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/router.ts#L510)

***

### call()

> `protected` **call**(`_context`, `params`): `Promise`\<`unknown`\>

Handles wm_call method to execute a single wallet method.
Routes the call to appropriate wallet after validation.

#### Parameters

##### \_context

[`RouterContext`](../interfaces/RouterContext.md)

Router context (unused but required by interface)

##### params

[`CallParams`](../interfaces/CallParams.md)

Parameters including chain ID and method call details

#### Returns

`Promise`\<`unknown`\>

Result of the method call

#### Throws

If chain validation fails or method execution fails

#### Defined in

[packages/router/src/router.ts:490](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/router.ts#L490)

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

> `protected` **connect**(`context`, `params`): `Promise`\<\{ `permissions`: [`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md); `sessionId`: `string`; \}\>

Handles wm_connect method to establish a new session.
Creates a new session with requested permissions after approval.

#### Parameters

##### context

[`RouterContext`](../interfaces/RouterContext.md)

Router context with origin information

##### params

Connection parameters including requested permissions

###### permissions

[`ChainPermissions`](../type-aliases/ChainPermissions.md)

#### Returns

`Promise`\<\{ `permissions`: [`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md); `sessionId`: `string`; \}\>

Object containing new session ID and approved permissions

#### Throws

If origin is unknown or no chains specified

#### Defined in

[packages/router/src/router.ts:230](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/router.ts#L230)

***

### disconnect()

> `protected` **disconnect**(`context`, `params`): `Promise`\<`boolean`\>

Handles wm_disconnect method to end an existing session.
Cleans up session data and emits termination event.

#### Parameters

##### context

[`RouterContext`](../interfaces/RouterContext.md)

Router context with session information

##### params

Disconnection parameters including session ID

###### sessionId

`string`

#### Returns

`Promise`\<`boolean`\>

true if session was successfully ended

#### Throws

With code 'invalidSession' if session is invalid

#### Defined in

[packages/router/src/router.ts:370](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/router.ts#L370)

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

> `protected` **getPermissions**(`context`, `params`): `Promise`\<[`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)\>

Handles wm_getPermissions method to retrieve current permissions.
Returns permissions for specified chains or all chains if none specified.

#### Parameters

##### context

[`RouterContext`](../interfaces/RouterContext.md)

Router context with session information

##### params

Parameters including optional chain IDs to filter by

###### chainIds

`string`[]

###### sessionId

`string`

#### Returns

`Promise`\<[`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)\>

Current permissions in human-readable format

#### Throws

With code 'invalidSession' if session is invalid

#### Defined in

[packages/router/src/router.ts:407](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/router.ts#L407)

***

### getSupportedMethods()

> `protected` **getSupportedMethods**(`_context`, `params`): `Promise`\<`Record`\<`string`, `string`[]\>\>

Handles wm_getSupportedMethods method to discover available methods.
Returns router methods if no chains specified, otherwise returns
methods supported by specified chains.

#### Parameters

##### \_context

[`RouterContext`](../interfaces/RouterContext.md)

Router context (unused but required by interface)

##### params

Parameters including optional chain IDs to query

###### chainIds

`string`[]

#### Returns

`Promise`\<`Record`\<`string`, `string`[]\>\>

Record mapping chain IDs to their supported method names

#### Throws

If chain validation fails or capability query fails

#### Defined in

[packages/router/src/router.ts:547](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/router.ts#L547)

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

### reconnect()

> `protected` **reconnect**(`context`, `params`): `Promise`\<\{ `permissions`: [`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md); `status`: `boolean`; \}\>

Handles wm_reconnect method to restore an existing session.
Validates the session and returns current permissions if valid.

#### Parameters

##### context

[`RouterContext`](../interfaces/RouterContext.md)

Router context with origin information

##### params

Reconnection parameters including session ID

###### sessionId

`string`

#### Returns

`Promise`\<\{ `permissions`: [`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md); `status`: `boolean`; \}\>

Object with reconnection status and current permissions

#### Throws

If origin is unknown

#### Defined in

[packages/router/src/router.ts:337](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/router.ts#L337)

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

### removeWallet()

> **removeWallet**(`chainId`): `void`

Removes a wallet client for a specific chain ID.
Cleans up event listeners and emits availability notification.

#### Parameters

##### chainId

`string`

Chain ID to remove wallet for

#### Returns

`void`

#### Throws

With code 'unknownChain' if chain is not configured

#### Example

```typescript
router.removeWallet('eip155:137'); // Remove Polygon wallet
```

#### Defined in

[packages/router/src/router.ts:192](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/router.ts#L192)

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

### setupWalletEventListeners()

> `protected` **setupWalletEventListeners**(`wallets`): `void`

Sets up event listeners for all wallet clients.
Handles wallet events like disconnects and forwards them to clients.

#### Parameters

##### wallets

[`Wallets`](../type-aliases/Wallets.md)

Map of chain IDs to wallet clients to setup listeners for

#### Returns

`void`

#### Defined in

[packages/router/src/router.ts:273](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/router.ts#L273)

***

### updatePermissions()

> `protected` **updatePermissions**(`context`, `params`): `Promise`\<[`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)\>

Handles wm_updatePermissions method to modify existing permissions.
Updates session with newly approved permissions.

#### Parameters

##### context

[`RouterContext`](../interfaces/RouterContext.md)

Router context with session information

##### params

Parameters including new permission requests

###### permissions

[`ChainPermissions`](../type-aliases/ChainPermissions.md)

###### sessionId

`string`

#### Returns

`Promise`\<[`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)\>

Newly approved permissions in human-readable format

#### Throws

With code 'invalidSession' if session is invalid

#### Defined in

[packages/router/src/router.ts:433](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/router.ts#L433)

***

### validateChain()

> `protected` **validateChain**(`chainId`): [`WalletClient`](../interfaces/WalletClient.md)

Validates a chain ID and returns its corresponding JSON-RPC client.

#### Parameters

##### chainId

`string`

Chain ID to validate

#### Returns

[`WalletClient`](../interfaces/WalletClient.md)

The wallet client for the specified chain

#### Throws

With code 'unknownChain' if the chain ID is not configured

#### Defined in

[packages/router/src/router.ts:138](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/router.ts#L138)
