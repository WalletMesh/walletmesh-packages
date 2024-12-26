[@walletmesh/router - v0.0.6](../README.md) / [Exports](../modules.md) / WalletRouter

# Class: WalletRouter

Multi-chain router for managing wallet connections with bi-directional communication.
Routes JSON-RPC requests to appropriate wallet instances based on chain ID and
forwards wallet events back to connected clients.

The router manages:
- Wallet sessions and permissions through callbacks
- Bi-directional communication with wallets and clients
- Event propagation for wallet state changes
- Session lifecycle events

**`Example`**

```typescript
const wallets = new Map([
  ['aztec:testnet', new JSONRPCWalletClient(new JSONRPCPeer(...))],
  ['eip155:1', new JSONRPCWalletClient(new JSONRPCPeer(...))]
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

## Hierarchy

- `JSONRPCPeer`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md), [`RouterEventMap`](../interfaces/RouterEventMap.md), [`RouterContext`](../interfaces/RouterContext.md)\>

  ↳ **`WalletRouter`**

## Table of contents

### Constructors

- [constructor](WalletRouter.md#constructor)

### Properties

- [context](WalletRouter.md#context)
- [sessionStore](WalletRouter.md#sessionstore)

### Methods

- [\_call](WalletRouter.md#_call)
- [addMiddleware](WalletRouter.md#addmiddleware)
- [bulkCall](WalletRouter.md#bulkcall)
- [call](WalletRouter.md#call)
- [callMethod](WalletRouter.md#callmethod)
- [connect](WalletRouter.md#connect)
- [disconnect](WalletRouter.md#disconnect)
- [emit](WalletRouter.md#emit)
- [getPermissions](WalletRouter.md#getpermissions)
- [getSupportedMethods](WalletRouter.md#getsupportedmethods)
- [notify](WalletRouter.md#notify)
- [on](WalletRouter.md#on)
- [receiveMessage](WalletRouter.md#receivemessage)
- [reconnect](WalletRouter.md#reconnect)
- [registerMethod](WalletRouter.md#registermethod)
- [registerSerializer](WalletRouter.md#registerserializer)
- [updatePermissions](WalletRouter.md#updatepermissions)
- [validateChain](WalletRouter.md#validatechain)
- [validateSession](WalletRouter.md#validatesession)

## Constructors

### constructor

• **new WalletRouter**(`transport`, `wallets`, `permissionCallback`, `permissionApprovalCallback`, `sessionStore?`): [`WalletRouter`](WalletRouter.md)

Creates a new WalletRouter instance for managing multi-chain wallet connections.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `transport` | `Object` | `undefined` | Transport layer for JSON-RPC communication Must implement a send method that handles message delivery Messages include method calls, responses, and events Example: { send: msg => websocket.send(JSON.stringify(msg)) } |
| `transport.send` | (`message`: `unknown`) => `Promise`\<`void`\> | `undefined` | - |
| `wallets` | [`Wallets`](../modules.md#wallets) | `undefined` | Map of supported blockchain networks to their wallet clients Keys are chain IDs (e.g., 'eip155:1' for Ethereum mainnet) Values are WalletClient implementations for each chain Example: new Map([['eip155:1', ethereumWallet]]) |
| `permissionCallback` | [`PermissionCallback`](../modules.md#permissioncallback) | `undefined` | Function to validate operation permissions Called before every method call and state change Receives complete context including chain, method, and session Must return Promise<boolean> indicating if operation is allowed |
| `permissionApprovalCallback` | [`PermissionApprovalCallback`](../modules.md#permissionapprovalcallback) | `undefined` | Function to approve permission requests Called during connect and permission update operations Can modify requested permissions before approval Must return Promise<ChainPermissions> with approved permissions |
| `sessionStore` | [`SessionStore`](../interfaces/SessionStore.md) | `defaultStore` | Optional custom session storage implementation Must implement SessionStore interface Defaults to in-memory store if not provided Use for persistent sessions across restarts |

#### Returns

[`WalletRouter`](WalletRouter.md)

**`Example`**

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

JSONRPCPeer\&lt;RouterMethodMap, RouterEventMap, RouterContext\&gt;.constructor

#### Defined in

[packages/router/src/router.ts:116](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/router.ts#L116)

## Properties

### context

• `Readonly` **context**: [`RouterContext`](../interfaces/RouterContext.md)

#### Inherited from

JSONRPCPeer.context

#### Defined in

packages/jsonrpc/dist/peer.d.ts:154

___

### sessionStore

• `Protected` **sessionStore**: [`SessionStore`](../interfaces/SessionStore.md)

#### Defined in

[packages/router/src/router.ts:55](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/router.ts#L55)

## Methods

### \_call

▸ **_call**(`client`, `methodCall`): `Promise`\<`unknown`\>

Internal helper to execute a method call on a wallet

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`WalletClient`](../interfaces/WalletClient.md) | JSON-RPC client instance for the wallet |
| `methodCall` | [`MethodCall`](../interfaces/MethodCall.md) | Method call details |

#### Returns

`Promise`\<`unknown`\>

Result from the wallet method call

**`Throws`**

If method is not supported or wallet is unavailable

#### Defined in

[packages/router/src/router.ts:620](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/router.ts#L620)

___

### addMiddleware

▸ **addMiddleware**(`middleware`): () => `void`

Adds a middleware function to the middleware stack.
Middleware functions are executed in the order they are added,
and can modify both requests and responses.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `middleware` | `JSONRPCMiddleware`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md), [`RouterContext`](../interfaces/RouterContext.md)\> | The middleware function to add |

#### Returns

`fn`

A cleanup function that removes the middleware when called

▸ (): `void`

##### Returns

`void`

**`Example`**

```typescript
const cleanup = peer.addMiddleware(async (context, request, next) => {
  console.log('Request:', request);
  const response = await next();
  console.log('Response:', response);
  return response;
});

// Later...
cleanup(); // Remove the middleware
```

#### Inherited from

JSONRPCPeer.addMiddleware

#### Defined in

packages/jsonrpc/dist/peer.d.ts:297

___

### bulkCall

▸ **bulkCall**(`context`, `params`): `Promise`\<`unknown`[]\>

Handles wm_bulkCall method
Executes multiple method calls in sequence on the same chain

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `context` | [`RouterContext`](../interfaces/RouterContext.md) | Router context (unused) |
| `params` | [`BulkCallParams`](../interfaces/BulkCallParams.md) | Parameters including chain ID, session ID, and array of method calls |

#### Returns

`Promise`\<`unknown`[]\>

Array of results from the wallet method calls

**`Throws`**

If session is invalid, chain is unknown, permissions are insufficient,
                     or if there's a partial failure during execution

#### Defined in

[packages/router/src/router.ts:645](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/router.ts#L645)

___

### call

▸ **call**(`context`, `params`): `Promise`\<`unknown`\>

Handles wm_call method
Routes method calls to the appropriate wallet instance after validating permissions

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `context` | [`RouterContext`](../interfaces/RouterContext.md) | Router context (unused) |
| `params` | [`CallParams`](../interfaces/CallParams.md) | Call parameters including chain ID, session ID, and method details |

#### Returns

`Promise`\<`unknown`\>

Result from the wallet method call

**`Throws`**

If session is invalid, chain is unknown, or permissions are insufficient

#### Defined in

[packages/router/src/router.ts:600](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/router.ts#L600)

___

### callMethod

▸ **callMethod**\<`M`\>(`method`, `params?`, `timeoutInSeconds?`): `Promise`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)[`M`][``"result"``]\>

Calls a method on the remote peer.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `method` | `M` | The name of the method to call |
| `params?` | [`RouterMethodMap`](../interfaces/RouterMethodMap.md)[`M`][``"params"``] | The parameters to pass to the method |
| `timeoutInSeconds?` | `number` | Optional timeout in seconds (0 means no timeout) |

#### Returns

`Promise`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)[`M`][``"result"``]\>

A promise that resolves with the method result

**`Throws`**

If the method call fails or times out

**`Example`**

```typescript
try {
  const result = await peer.callMethod('add', { a: 1, b: 2 }, 5);
  console.log('Result:', result);
} catch (error) {
  console.error('Error:', error);
}
```

#### Inherited from

JSONRPCPeer.callMethod

#### Defined in

packages/jsonrpc/dist/peer.d.ts:214

___

### connect

▸ **connect**(`context`, `params`): `Promise`\<\{ `permissions`: [`ChainPermissions`](../modules.md#chainpermissions) ; `sessionId`: `string`  }\>

Handles wm_connect method
Creates a new session for the specified chain with requested permissions

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `context` | [`RouterContext`](../interfaces/RouterContext.md) | Router context (unused) |
| `params` | `Object` | Connection parameters including chain ID and permissions |
| `params.permissions` | [`ChainPermissions`](../modules.md#chainpermissions) | - |

#### Returns

`Promise`\<\{ `permissions`: [`ChainPermissions`](../modules.md#chainpermissions) ; `sessionId`: `string`  }\>

Object containing the new session ID

**`Throws`**

If chain ID is invalid

#### Defined in

[packages/router/src/router.ts:309](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/router.ts#L309)

___

### disconnect

▸ **disconnect**(`context`, `params`): `Promise`\<`boolean`\>

Handles the wm_disconnect method to terminate an active session.
Performs complete cleanup including:
- Session removal from store
- Event listener cleanup
- State cleanup for affected chains
- Event emission for disconnection

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `context` | [`RouterContext`](../interfaces/RouterContext.md) | Router context containing: - origin: Origin requesting disconnect Must match the session origin for security |
| `params` | `Object` | Disconnect parameters including: - sessionId: ID of session to terminate Must be a valid UUID from previous connect call |
| `params.sessionId` | `string` | - |

#### Returns

`Promise`\<`boolean`\>

true if session was successfully terminated

**`Throws`**

With codes:
        - 'invalidSession': Session doesn't exist or origin mismatch

**`Emits`**

wm_sessionTerminated When session is successfully terminated

**`Example`**

```typescript
await disconnect(
  { origin: 'https://app.example.com' },
  { sessionId: 'active-session-id' }
);
// Emits: wm_sessionTerminated event
```

#### Defined in

[packages/router/src/router.ts:454](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/router.ts#L454)

___

### emit

▸ **emit**\<`K`\>(`event`, `params`): `void`

Emits an event to the remote peer.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends keyof [`RouterEventMap`](../interfaces/RouterEventMap.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `K` | The name of the event to emit |
| `params` | [`RouterEventMap`](../interfaces/RouterEventMap.md)[`K`] | The event parameters |

#### Returns

`void`

**`Example`**

```typescript
peer.emit('statusUpdate', {
  user: 'Alice',
  status: 'online'
});
```

#### Inherited from

JSONRPCPeer.emit

#### Defined in

packages/jsonrpc/dist/peer.d.ts:259

___

### getPermissions

▸ **getPermissions**(`context`, `params`): `Promise`\<[`ChainPermissions`](../modules.md#chainpermissions)\>

Handles the wm_getPermissions method to retrieve current session permissions.
Can return permissions for specific chains or all chains in the session.
Validates session before returning permissions.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `context` | [`RouterContext`](../interfaces/RouterContext.md) | Router context containing: - origin: Origin requesting permissions Must match the session origin |
| `params` | `Object` | Permission request parameters: - sessionId: ID of session to query - chainIds: Optional array of specific chains to query If omitted, returns permissions for all chains |
| `params.chainIds?` | `string`[] | - |
| `params.sessionId` | `string` | - |

#### Returns

`Promise`\<[`ChainPermissions`](../modules.md#chainpermissions)\>

ChainPermissions object mapping chain IDs to allowed methods

**`Throws`**

With codes:
        - 'invalidSession': Session doesn't exist or origin mismatch
        - 'invalidSession': Requested chain not in session

**`Example`**

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

[packages/router/src/router.ts:526](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/router.ts#L526)

___

### getSupportedMethods

▸ **getSupportedMethods**(`_context`, `params`): `Promise`\<`Record`\<`string`, `string`[]\>\>

Handles wm_getSupportedMethods method
If chainIds is provided, queries the wallets for their supported methods
If no chainIds provided, returns the methods supported by the router itself

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_context` | [`RouterContext`](../interfaces/RouterContext.md) | - |
| `params` | `Object` | Parameters including optional array of chain IDs |
| `params.chainIds?` | `string`[] | - |

#### Returns

`Promise`\<`Record`\<`string`, `string`[]\>\>

Record mapping chain IDs to their supported methods

**`Throws`**

If any chain is unknown or wallet is unavailable

#### Defined in

[packages/router/src/router.ts:686](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/router.ts#L686)

___

### notify

▸ **notify**\<`M`\>(`method`, `params`): `void`

Sends a notification to the remote peer (no response expected).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `method` | `M` | The name of the method to call |
| `params` | [`RouterMethodMap`](../interfaces/RouterMethodMap.md)[`M`][``"params"``] | The parameters to pass to the method |

#### Returns

`void`

**`Example`**

```typescript
peer.notify('logMessage', { level: 'info', message: 'Hello' });
```

#### Inherited from

JSONRPCPeer.notify

#### Defined in

packages/jsonrpc/dist/peer.d.ts:226

___

### on

▸ **on**\<`K`\>(`event`, `handler`): () => `void`

Registers a handler for a specific event type.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends keyof [`RouterEventMap`](../interfaces/RouterEventMap.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `K` | The name of the event to handle |
| `handler` | `JSONRPCEventHandler`\<[`RouterEventMap`](../interfaces/RouterEventMap.md), `K`\> | The function to call when the event is received |

#### Returns

`fn`

A cleanup function that removes the event handler when called

▸ (): `void`

##### Returns

`void`

**`Example`**

```typescript
const cleanup = peer.on('userJoined', ({ username }) => {
  console.log(`${username} joined`);
});

// Later...
cleanup(); // Remove the event handler
```

#### Inherited from

JSONRPCPeer.on

#### Defined in

packages/jsonrpc/dist/peer.d.ts:244

___

### receiveMessage

▸ **receiveMessage**(`message`): `Promise`\<`void`\>

Handles an incoming message from the remote peer.
This should be called whenever a message is received through the transport.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `unknown` | The received message |

#### Returns

`Promise`\<`void`\>

A promise that resolves when the message has been handled

**`Example`**

```typescript
websocket.on('message', async (data) => {
  await peer.receiveMessage(JSON.parse(data));
});
```

#### Inherited from

JSONRPCPeer.receiveMessage

#### Defined in

packages/jsonrpc/dist/peer.d.ts:274

___

### reconnect

▸ **reconnect**(`context`, `params`): `Promise`\<\{ `permissions`: [`ChainPermissions`](../modules.md#chainpermissions) ; `status`: `boolean`  }\>

Handles the wm_reconnect method to restore an existing session.
Validates and refreshes an existing session without requiring new permissions.
Used when clients need to re-establish connection after page reload or disconnect.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `context` | [`RouterContext`](../interfaces/RouterContext.md) | Router context containing: - origin: Origin attempting to reconnect Must match the original session origin |
| `params` | `Object` | Reconnection parameters including: - sessionId: ID of session to reconnect to Must be a valid UUID from previous connect call |
| `params.sessionId` | `string` | - |

#### Returns

`Promise`\<\{ `permissions`: [`ChainPermissions`](../modules.md#chainpermissions) ; `status`: `boolean`  }\>

Object containing:
         - status: boolean indicating if reconnection succeeded
         - permissions: Current permissions if successful, empty if failed

**`Example`**

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

[packages/router/src/router.ts:169](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/router.ts#L169)

___

### registerMethod

▸ **registerMethod**\<`M`\>(`name`, `handler`, `serializer?`): `void`

Registers a method that can be called by remote peers.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `M` | The name of the method to register |
| `handler` | `MethodHandler`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md), `M`, [`RouterContext`](../interfaces/RouterContext.md)\> | The function that implements the method |
| `serializer?` | `JSONRPCSerializer`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)[`M`][``"params"``], [`RouterMethodMap`](../interfaces/RouterMethodMap.md)[`M`][``"result"``]\> | Optional serializer for method parameters and results |

#### Returns

`void`

**`Example`**

```typescript
peer.registerMethod('add', async (context, params) => {
  return params.a + params.b;
});
```

#### Inherited from

JSONRPCPeer.registerMethod

#### Defined in

packages/jsonrpc/dist/peer.d.ts:176

___

### registerSerializer

▸ **registerSerializer**\<`M`\>(`method`, `serializer`): `void`

Registers a serializer for a remote method.
Used when calling methods that require parameter or result serialization.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `method` | `M` | The name of the method to register a serializer for |
| `serializer` | `JSONRPCSerializer`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)[`M`][``"params"``], [`RouterMethodMap`](../interfaces/RouterMethodMap.md)[`M`][``"result"``]\> | The serializer implementation |

#### Returns

`void`

**`Example`**

```typescript
peer.registerSerializer('processDate', {
  params: {
    serialize: (date) => ({ serialized: date.toISOString() }),
    deserialize: (data) => new Date(data.serialized)
  }
});
```

#### Inherited from

JSONRPCPeer.registerSerializer

#### Defined in

packages/jsonrpc/dist/peer.d.ts:194

___

### updatePermissions

▸ **updatePermissions**(`context`, `params`): `Promise`\<`boolean`\>

Handles wm_updatePermissions method
Updates the permissions for an existing session

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `context` | [`RouterContext`](../interfaces/RouterContext.md) | Router context (unused) |
| `params` | `Object` | Parameters including session ID and new permissions |
| `params.permissions` | [`ChainPermissions`](../modules.md#chainpermissions) | - |
| `params.sessionId` | `string` | - |

#### Returns

`Promise`\<`boolean`\>

true if permissions were successfully updated

**`Throws`**

If session ID is invalid

#### Defined in

[packages/router/src/router.ts:559](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/router.ts#L559)

___

### validateChain

▸ **validateChain**(`chainId`): [`WalletClient`](../interfaces/WalletClient.md)

Validates a chain ID and returns its corresponding JSON-RPC client

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `chainId` | `string` | Chain ID to validate |

#### Returns

[`WalletClient`](../interfaces/WalletClient.md)

JSON-RPC client for the chain

**`Throws`**

If chain ID is unknown or not configured

#### Defined in

[packages/router/src/router.ts:293](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/router.ts#L293)

___

### validateSession

▸ **validateSession**(`operation`, `sessionId`, `chainId`, `method`, `params?`, `context?`): `Promise`\<[`SessionData`](../interfaces/SessionData.md)\>

Validates a session and its permissions for an operation.
Performs comprehensive validation including:
- Session existence and expiration
- Chain ID validation
- Permission checks
- Origin verification

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `operation` | [`OperationType`](../modules.md#operationtype) | Type of operation being performed Examples: 'connect', 'call', 'disconnect' Used to apply operation-specific validation rules |
| `sessionId` | `string` | ID of the session to validate Must be a valid UUID from a previous connect call Combined with origin to form unique session key |
| `chainId` | `string` | Chain ID for the request Must match format: namespace:reference Example: 'eip155:1' for Ethereum mainnet Use '*' only for updatePermissions operations |
| `method` | `string` | Method being called Must be included in session's permissions Example: 'eth_sendTransaction' Wildcard '*' only allowed for permission updates |
| `params?` | `unknown` | Method parameters (optional) Passed to permission callback for validation Type depends on the specific method |
| `context?` | [`RouterContext`](../interfaces/RouterContext.md) | Router context containing origin Must include origin for session validation Example: { origin: 'https://app.example.com' } |

#### Returns

`Promise`\<[`SessionData`](../interfaces/SessionData.md)\>

The validated session data if all checks pass

**`Throws`**

With specific error codes:
        - 'invalidSession': Session doesn't exist or is expired
        - 'insufficientPermissions': Method not allowed for session
        - 'invalidRequest': Invalid parameters or chain ID

**`Example`**

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

[packages/router/src/router.ts:244](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/router.ts#L244)
