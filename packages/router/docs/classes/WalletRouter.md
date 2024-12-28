[**@walletmesh/router v0.1.4**](../README.md)

***

[@walletmesh/router](../globals.md) / WalletRouter

# Class: WalletRouter

Multi-chain router for managing wallet connections with bi-directional communication.
Routes JSON-RPC requests to appropriate wallet instances based on chain ID and
forwards wallet events back to connected clients.

The router manages:
- Wallet sessions and permissions through callbacks
- Bi-directional communication with wallets and clients
- Event propagation for wallet state changes
- Session lifecycle events

## Example

```typescript
const wallets = new Map([
  ['aztec:testnet', new JSONRPCWalletClient(new JSONRPCNode(...))],
  ['eip155:1', new JSONRPCWalletClient(new JSONRPCNode(...))]
]);

const router = new WalletRouter(
  {
    send: async (message) => {
      // Send response/event to client
      await sendToClient(message);
    }
  },
  wallets,
  // Example permission callback
  async (context) => {
    // Allow everything in development
    return true;
  }
);
```

## Extends

- `JSONRPCNode`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md), [`RouterEventMap`](../interfaces/RouterEventMap.md), [`RouterContext`](../interfaces/RouterContext.md)\>

## Constructors

### new WalletRouter()

> **new WalletRouter**(`transport`, `wallets`, `permissionCallback`, `permissionApprovalCallback`, `sessionStore`): [`WalletRouter`](WalletRouter.md)

Creates a new WalletRouter instance for managing multi-chain wallet connections.

#### Parameters

##### transport

Transport layer for JSON-RPC communication
                  Must implement a send method that handles message delivery
                  Messages include method calls, responses, and events
                  Example: { send: msg => websocket.send(JSON.stringify(msg)) }

###### send

(`message`) => `Promise`\<`void`\>

##### wallets

[`Wallets`](../type-aliases/Wallets.md)

Map of supported blockchain networks to their wallet clients
                Keys are chain IDs (e.g., 'eip155:1' for Ethereum mainnet)
                Values are WalletClient implementations for each chain
                Example: new Map([['eip155:1', ethereumWallet]])

##### permissionCallback

[`PermissionCallback`](../type-aliases/PermissionCallback.md)

Function to validate operation permissions
                          Called before every method call and state change
                          Receives complete context including chain, method, and session
                          Must return Promise<boolean> indicating if operation is allowed

##### permissionApprovalCallback

[`PermissionApprovalCallback`](../type-aliases/PermissionApprovalCallback.md)

Function to approve permission requests
                                  Called during connect and permission update operations
                                  Can modify requested permissions before approval
                                  Must return Promise<ChainPermissions> with approved permissions

##### sessionStore

[`SessionStore`](../interfaces/SessionStore.md) = `defaultStore`

Optional custom session storage implementation
                    Must implement SessionStore interface
                    Defaults to in-memory store if not provided
                    Use for persistent sessions across restarts

#### Returns

[`WalletRouter`](WalletRouter.md)

#### Example

```typescript
const router = new WalletRouter(
  {
    send: msg => websocket.send(JSON.stringify(msg))
  },
  new Map([
    ['eip155:1', ethereumWallet],
    ['eip155:137', polygonWallet]
  ]),
  async (context) => {
    // Check if operation is allowed
    return isOperationAllowed(context);
  },
  async (context) => {
    // Approve and possibly modify permissions
    return approvePermissions(context);
  },
  new CustomSessionStore()
);
```

#### Overrides

`JSONRPCNode<RouterMethodMap, RouterEventMap, RouterContext>.constructor`

#### Defined in

[packages/router/src/router.ts:116](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/router.ts#L116)

## Properties

### context

> `readonly` **context**: [`RouterContext`](../interfaces/RouterContext.md)

#### Inherited from

`JSONRPCNode.context`

#### Defined in

packages/jsonrpc/dist/node.d.ts:154

***

### sessionStore

> `protected` **sessionStore**: [`SessionStore`](../interfaces/SessionStore.md)

#### Defined in

[packages/router/src/router.ts:55](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/router.ts#L55)

## Methods

### \_call()

> `protected` **\_call**(`client`, `methodCall`): `Promise`\<`unknown`\>

Internal helper to execute a method call on a wallet

#### Parameters

##### client

[`WalletClient`](../interfaces/WalletClient.md)

JSON-RPC client instance for the wallet

##### methodCall

[`MethodCall`](../interfaces/MethodCall.md)

Method call details

#### Returns

`Promise`\<`unknown`\>

Result from the wallet method call

#### Throws

If method is not supported or wallet is unavailable

#### Defined in

[packages/router/src/router.ts:620](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/router.ts#L620)

***

### addMiddleware()

> **addMiddleware**(`middleware`): () => `void`

Adds a middleware function to the middleware stack.
Middleware functions are executed in the order they are added,
and can modify both requests and responses.

#### Parameters

##### middleware

`JSONRPCMiddleware`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md), [`RouterContext`](../interfaces/RouterContext.md)\>

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

#### Inherited from

`JSONRPCNode.addMiddleware`

#### Defined in

packages/jsonrpc/dist/node.d.ts:297

***

### bulkCall()

> `protected` **bulkCall**(`context`, `params`): `Promise`\<`unknown`[]\>

Handles wm_bulkCall method
Executes multiple method calls in sequence on the same chain

#### Parameters

##### context

[`RouterContext`](../interfaces/RouterContext.md)

Router context (unused)

##### params

[`BulkCallParams`](../interfaces/BulkCallParams.md)

Parameters including chain ID, session ID, and array of method calls

#### Returns

`Promise`\<`unknown`[]\>

Array of results from the wallet method calls

#### Throws

If session is invalid, chain is unknown, permissions are insufficient,
                     or if there's a partial failure during execution

#### Defined in

[packages/router/src/router.ts:645](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/router.ts#L645)

***

### call()

> `protected` **call**(`context`, `params`): `Promise`\<`unknown`\>

Handles wm_call method
Routes method calls to the appropriate wallet instance after validating permissions

#### Parameters

##### context

[`RouterContext`](../interfaces/RouterContext.md)

Router context (unused)

##### params

[`CallParams`](../interfaces/CallParams.md)

Call parameters including chain ID, session ID, and method details

#### Returns

`Promise`\<`unknown`\>

Result from the wallet method call

#### Throws

If session is invalid, chain is unknown, or permissions are insufficient

#### Defined in

[packages/router/src/router.ts:600](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/router.ts#L600)

***

### callMethod()

> **callMethod**\<`M`\>(`method`, `params`?, `timeoutInSeconds`?): `Promise`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

Calls a method on the remote node.

#### Type Parameters

• **M** *extends* keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)

#### Parameters

##### method

`M`

The name of the method to call

##### params?

[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"params"`\]

The parameters to pass to the method

##### timeoutInSeconds?

`number`

Optional timeout in seconds (0 means no timeout)

#### Returns

`Promise`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

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

#### Inherited from

`JSONRPCNode.callMethod`

#### Defined in

packages/jsonrpc/dist/node.d.ts:214

***

### connect()

> `protected` **connect**(`context`, `params`): `Promise`\<\{ `permissions`: [`ChainPermissions`](../type-aliases/ChainPermissions.md); `sessionId`: `string`; \}\>

Handles wm_connect method
Creates a new session for the specified chain with requested permissions

#### Parameters

##### context

[`RouterContext`](../interfaces/RouterContext.md)

Router context (unused)

##### params

Connection parameters including chain ID and permissions

###### permissions

[`ChainPermissions`](../type-aliases/ChainPermissions.md)

#### Returns

`Promise`\<\{ `permissions`: [`ChainPermissions`](../type-aliases/ChainPermissions.md); `sessionId`: `string`; \}\>

Object containing the new session ID

#### Throws

If chain ID is invalid

#### Defined in

[packages/router/src/router.ts:309](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/router.ts#L309)

***

### disconnect()

> `protected` **disconnect**(`context`, `params`): `Promise`\<`boolean`\>

Handles the wm_disconnect method to terminate an active session.
Performs complete cleanup including:
- Session removal from store
- Event listener cleanup
- State cleanup for affected chains
- Event emission for disconnection

#### Parameters

##### context

[`RouterContext`](../interfaces/RouterContext.md)

Router context containing:
                 - origin: Origin requesting disconnect
                 Must match the session origin for security

##### params

Disconnect parameters including:
               - sessionId: ID of session to terminate
               Must be a valid UUID from previous connect call

###### sessionId

`string`

#### Returns

`Promise`\<`boolean`\>

true if session was successfully terminated

#### Throws

With codes:
        - 'invalidSession': Session doesn't exist or origin mismatch

#### Emits

wm_sessionTerminated When session is successfully terminated

#### Example

```typescript
await disconnect(
  { origin: 'https://app.example.com' },
  { sessionId: 'active-session-id' }
);
// Emits: wm_sessionTerminated event
```

#### Defined in

[packages/router/src/router.ts:454](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/router.ts#L454)

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

#### Inherited from

`JSONRPCNode.emit`

#### Defined in

packages/jsonrpc/dist/node.d.ts:259

***

### getPermissions()

> `protected` **getPermissions**(`context`, `params`): `Promise`\<[`ChainPermissions`](../type-aliases/ChainPermissions.md)\>

Handles the wm_getPermissions method to retrieve current session permissions.
Can return permissions for specific chains or all chains in the session.
Validates session before returning permissions.

#### Parameters

##### context

[`RouterContext`](../interfaces/RouterContext.md)

Router context containing:
                 - origin: Origin requesting permissions
                 Must match the session origin

##### params

Permission request parameters:
               - sessionId: ID of session to query
               - chainIds: Optional array of specific chains to query
                 If omitted, returns permissions for all chains

###### chainIds

`string`[]

###### sessionId

`string`

#### Returns

`Promise`\<[`ChainPermissions`](../type-aliases/ChainPermissions.md)\>

ChainPermissions object mapping chain IDs to allowed methods

#### Throws

With codes:
        - 'invalidSession': Session doesn't exist or origin mismatch
        - 'invalidSession': Requested chain not in session

#### Example

```typescript
// Get all permissions
const allPerms = await getPermissions(
  { origin: 'https://app.example.com' },
  { sessionId: 'session-id' }
);

// Get specific chain permissions
const ethPerms = await getPermissions(
  { origin: 'https://app.example.com' },
  {
    sessionId: 'session-id',
    chainIds: ['eip155:1']
  }
);
```

#### Defined in

[packages/router/src/router.ts:526](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/router.ts#L526)

***

### getSupportedMethods()

> `protected` **getSupportedMethods**(`_context`, `params`): `Promise`\<`Record`\<`string`, `string`[]\>\>

Handles wm_getSupportedMethods method
If chainIds is provided, queries the wallets for their supported methods
If no chainIds provided, returns the methods supported by the router itself

#### Parameters

##### \_context

[`RouterContext`](../interfaces/RouterContext.md)

##### params

Parameters including optional array of chain IDs

###### chainIds

`string`[]

#### Returns

`Promise`\<`Record`\<`string`, `string`[]\>\>

Record mapping chain IDs to their supported methods

#### Throws

If any chain is unknown or wallet is unavailable

#### Defined in

[packages/router/src/router.ts:686](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/router.ts#L686)

***

### notify()

> **notify**\<`M`\>(`method`, `params`): `void`

Sends a notification to the remote node.

#### Type Parameters

• **M** *extends* keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)

#### Parameters

##### method

`M`

The name of the method to call

##### params

[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"params"`\]

The parameters to pass to the method

#### Returns

`void`

#### Example

```typescript
node.notify('logMessage', { level: 'info', message: 'Hello' });
```

#### Inherited from

`JSONRPCNode.notify`

#### Defined in

packages/jsonrpc/dist/node.d.ts:226

***

### on()

> **on**\<`K`\>(`event`, `handler`): () => `void`

Registers a handler for a specific event type.

#### Type Parameters

• **K** *extends* keyof [`RouterEventMap`](../interfaces/RouterEventMap.md)

#### Parameters

##### event

`K`

The name of the event to handle

##### handler

`JSONRPCEventHandler`\<[`RouterEventMap`](../interfaces/RouterEventMap.md), `K`\>

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

#### Inherited from

`JSONRPCNode.on`

#### Defined in

packages/jsonrpc/dist/node.d.ts:244

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

#### Inherited from

`JSONRPCNode.receiveMessage`

#### Defined in

packages/jsonrpc/dist/node.d.ts:274

***

### reconnect()

> `protected` **reconnect**(`context`, `params`): `Promise`\<\{ `permissions`: [`ChainPermissions`](../type-aliases/ChainPermissions.md); `status`: `boolean`; \}\>

Handles the wm_reconnect method to restore an existing session.
Validates and refreshes an existing session without requiring new permissions.
Used when clients need to re-establish connection after page reload or disconnect.

#### Parameters

##### context

[`RouterContext`](../interfaces/RouterContext.md)

Router context containing:
                 - origin: Origin attempting to reconnect
                 Must match the original session origin

##### params

Reconnection parameters including:
               - sessionId: ID of session to reconnect to
               Must be a valid UUID from previous connect call

###### sessionId

`string`

#### Returns

`Promise`\<\{ `permissions`: [`ChainPermissions`](../type-aliases/ChainPermissions.md); `status`: `boolean`; \}\>

Object containing:
         - status: boolean indicating if reconnection succeeded
         - permissions: Current permissions if successful, empty if failed

#### Example

```typescript
const result = await reconnect(
  { origin: 'https://app.example.com' },
  { sessionId: 'previous-session-id' }
);
if (result.status) {
  console.log('Reconnected with permissions:', result.permissions);
}
```

#### Defined in

[packages/router/src/router.ts:169](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/router.ts#L169)

***

### registerMethod()

> **registerMethod**\<`M`\>(`name`, `handler`, `serializer`?): `void`

Registers a method that can be called by remote nodes.

#### Type Parameters

• **M** *extends* keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)

#### Parameters

##### name

`M`

The name of the method to register

##### handler

`MethodHandler`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md), `M`, [`RouterContext`](../interfaces/RouterContext.md)\>

The function that implements the method

##### serializer?

`JSONRPCSerializer`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"params"`\], [`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

Optional serializer for method parameters and results

#### Returns

`void`

#### Example

```typescript
node.registerMethod('add', async (context, params) => {
  return params.a + params.b;
});
```

#### Inherited from

`JSONRPCNode.registerMethod`

#### Defined in

packages/jsonrpc/dist/node.d.ts:176

***

### registerSerializer()

> **registerSerializer**\<`M`\>(`method`, `serializer`): `void`

Registers a serializer for a remote method.
Used when calling methods that require parameter or result serialization.

#### Type Parameters

• **M** *extends* keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)

#### Parameters

##### method

`M`

The name of the method to register a serializer for

##### serializer

`JSONRPCSerializer`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"params"`\], [`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

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

#### Inherited from

`JSONRPCNode.registerSerializer`

#### Defined in

packages/jsonrpc/dist/node.d.ts:194

***

### updatePermissions()

> `protected` **updatePermissions**(`context`, `params`): `Promise`\<`boolean`\>

Handles wm_updatePermissions method
Updates the permissions for an existing session

#### Parameters

##### context

[`RouterContext`](../interfaces/RouterContext.md)

Router context (unused)

##### params

Parameters including session ID and new permissions

###### permissions

[`ChainPermissions`](../type-aliases/ChainPermissions.md)

###### sessionId

`string`

#### Returns

`Promise`\<`boolean`\>

true if permissions were successfully updated

#### Throws

If session ID is invalid

#### Defined in

[packages/router/src/router.ts:559](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/router.ts#L559)

***

### validateChain()

> `protected` **validateChain**(`chainId`): [`WalletClient`](../interfaces/WalletClient.md)

Validates a chain ID and returns its corresponding JSON-RPC client

#### Parameters

##### chainId

`string`

Chain ID to validate

#### Returns

[`WalletClient`](../interfaces/WalletClient.md)

JSON-RPC client for the chain

#### Throws

If chain ID is unknown or not configured

#### Defined in

[packages/router/src/router.ts:293](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/router.ts#L293)

***

### validateSession()

> `protected` **validateSession**(`operation`, `sessionId`, `chainId`, `method`, `params`?, `context`?): `Promise`\<[`SessionData`](../interfaces/SessionData.md)\>

Validates a session and its permissions for an operation.
Performs comprehensive validation including:
- Session existence and expiration
- Chain ID validation
- Permission checks
- Origin verification

#### Parameters

##### operation

[`OperationType`](../type-aliases/OperationType.md)

Type of operation being performed
                  Examples: 'connect', 'call', 'disconnect'
                  Used to apply operation-specific validation rules

##### sessionId

`string`

ID of the session to validate
                  Must be a valid UUID from a previous connect call
                  Combined with origin to form unique session key

##### chainId

`string`

Chain ID for the request
                Must match format: namespace:reference
                Example: 'eip155:1' for Ethereum mainnet
                Use '*' only for updatePermissions operations

##### method

`string`

Method being called
               Must be included in session's permissions
               Example: 'eth_sendTransaction'
               Wildcard '*' only allowed for permission updates

##### params?

`unknown`

Method parameters (optional)
               Passed to permission callback for validation
               Type depends on the specific method

##### context?

[`RouterContext`](../interfaces/RouterContext.md)

Router context containing origin
                Must include origin for session validation
                Example: { origin: 'https://app.example.com' }

#### Returns

`Promise`\<[`SessionData`](../interfaces/SessionData.md)\>

The validated session data if all checks pass

#### Throws

With specific error codes:
        - 'invalidSession': Session doesn't exist or is expired
        - 'insufficientPermissions': Method not allowed for session
        - 'invalidRequest': Invalid parameters or chain ID

#### Example

```typescript
try {
  const session = await validateSession(
    'call',
    'session-123',
    'eip155:1',
    'eth_sendTransaction',
    { to: '0x...', value: '0x...' },
    { origin: 'https://app.example.com' }
  );
  // Session is valid, proceed with operation
} catch (error) {
  if (error instanceof RouterError) {
    // Handle specific validation failure
  }
}
```

#### Defined in

[packages/router/src/router.ts:244](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/router.ts#L244)
