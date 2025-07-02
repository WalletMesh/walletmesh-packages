[**@walletmesh/router v0.5.1**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / WalletRouter

# Class: WalletRouter

Defined in: [core/router/src/router.ts:85](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/router.ts#L85)

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

### Constructor

> **new WalletRouter**(`transport`, `wallets`, `permissionManager`, `config`): `WalletRouter`

Defined in: [core/router/src/router.ts:130](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/router.ts#L130)

Creates a new WalletRouter instance for managing multi-chain wallet connections.

#### Parameters

##### transport

`JSONRPCTransport`

Transport layer for sending messages

##### wallets

[`Wallets`](../type-aliases/Wallets.md)

Map of chain IDs to wallet transports

##### permissionManager

[`PermissionManager`](../interfaces/PermissionManager.md)\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md), [`RouterContext`](../interfaces/RouterContext.md)\>

Manager for handling permissions

##### config

[`WalletRouterConfig`](../interfaces/WalletRouterConfig.md) = `{}`

Optional router configuration

#### Returns

`WalletRouter`

#### Throws

If transport is invalid or required components are missing

#### Example

```typescript
const router = new WalletRouter(
  { send: async (msg) => window.postMessage(msg, '*') },
  new Map([['eip155:1', ethereumTransport]]),
  new AllowAskDenyManager(askCallback, initialState),
  { sessionStore: new LocalStorageSessionStore(), debug: true }
);
```

#### Overrides

`JSONRPCNode<RouterMethodMap, RouterEventMap, RouterContext>.constructor`

## Properties

### context

> `readonly` **context**: [`RouterContext`](../interfaces/RouterContext.md)

Defined in: core/jsonrpc/dist/node.d.ts:51

#### Inherited from

`JSONRPCNode.context`

***

### sessionStore

> `protected` **sessionStore**: [`SessionStore`](../interfaces/SessionStore.md)

Defined in: [core/router/src/router.ts:90](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/router.ts#L90)

Store for managing session data persistence and lifecycle

## Methods

### \_call()

> `protected` **\_call**(`proxy`, `methodCall`): `Promise`\<`unknown`\>

Defined in: [core/router/src/router.ts:433](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/router.ts#L433)

Forward a method call to a wallet using the proxy

#### Parameters

##### proxy

`JSONRPCProxy`

Proxy instance to forward the call through

##### methodCall

[`MethodCall`](../interfaces/MethodCall.md)

Method call details including name and parameters

#### Returns

`Promise`\<`unknown`\>

Result of the method call

#### Throws

With appropriate error code based on failure type

***

### addMiddleware()

> **addMiddleware**(`middleware`): () => `void`

Defined in: core/jsonrpc/dist/node.d.ts:122

Adds a middleware function to the request processing chain.
Middleware functions can intercept and modify incoming requests and outgoing responses.

#### Parameters

##### middleware

`JSONRPCMiddleware`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md), [`RouterContext`](../interfaces/RouterContext.md)\>

The middleware function to add.

#### Returns

A function that, when called, will remove this middleware.

> (): `void`

##### Returns

`void`

#### Inherited from

`JSONRPCNode.addMiddleware`

***

### addWallet()

> **addWallet**(`chainId`, `transport`): `void`

Defined in: [core/router/src/router.ts:204](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/router.ts#L204)

Adds a new wallet for a specific chain ID.

#### Parameters

##### chainId

`string`

Chain ID to add wallet for

##### transport

`JSONRPCTransport`

Wallet transport instance

#### Returns

`void`

#### Throws

With code 'chainAlreadyExists' if chain is already configured

#### Example

```typescript
const polygonTransport = createPolygonTransport();
router.addWallet('eip155:137', polygonTransport);
```

***

### bulkCall()

> `protected` **bulkCall**(`_context`, `params`): `Promise`\<`unknown`[]\>

Defined in: [core/router/src/router.ts:512](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/router.ts#L512)

Handles wm_bulkCall method to execute multiple wallet methods.
Executes calls in sequence and handles partial failures.

#### Parameters

##### \_context

[`RouterContext`](../interfaces/RouterContext.md)

Router context (unused but required by interface)

##### params

Parameters including chain ID and array of method calls

###### calls

[`MethodCall`](../interfaces/MethodCall.md)\<keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)\>[]

###### chainId

`string`

###### sessionId

`string`

#### Returns

`Promise`\<`unknown`[]\>

Array of results corresponding to each method call

#### Throws

With code 'partialFailure' if some calls succeed

***

### call()

> `protected` **call**(`_context`, `params`): `Promise`\<`unknown`\>

Defined in: [core/router/src/router.ts:492](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/router.ts#L492)

Handles wm_call method to execute a single wallet method.
Routes the call to appropriate wallet after validation.

#### Parameters

##### \_context

[`RouterContext`](../interfaces/RouterContext.md)

Router context (unused but required by interface)

##### params

Parameters including chain ID and method call details

###### call

[`MethodCall`](../interfaces/MethodCall.md)\<keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)\>

###### chainId

`string`

###### sessionId

`string`

#### Returns

`Promise`\<`unknown`\>

Result of the method call

#### Throws

If chain validation fails or method execution fails

***

### callMethod()

> **callMethod**\<`M`\>(`method`, `params?`, `timeoutInSeconds?`): `Promise`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

Defined in: core/jsonrpc/dist/node.d.ts:92

Calls a remote JSON-RPC method.

#### Type Parameters

##### M

`M` *extends* keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)

#### Parameters

##### method

`M`

The name of the method to call.

##### params?

[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"params"`\]

The parameters for the method call.

##### timeoutInSeconds?

`number`

Optional timeout for the request in seconds. Defaults to 0 (no timeout).

#### Returns

`Promise`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

A promise that resolves with the result of the method call.

#### Throws

If the request times out.

#### Throws

If the remote end returns an error.

#### Throws

If sending the request fails.

#### Inherited from

`JSONRPCNode.callMethod`

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [core/router/src/router.ts:597](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/router.ts#L597)

Clean up when closing

#### Returns

`Promise`\<`void`\>

#### Overrides

`JSONRPCNode.close`

***

### connect()

> `protected` **connect**(`context`, `params`): `Promise`\<\{ `permissions`: [`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md); `sessionId`: `string`; \}\>

Defined in: [core/router/src/router.ts:264](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/router.ts#L264)

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

***

### disconnect()

> `protected` **disconnect**(`context`, `params`): `Promise`\<`boolean`\>

Defined in: [core/router/src/router.ts:341](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/router.ts#L341)

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

***

### emit()

> **emit**\<`K`\>(`event`, `params`): `Promise`\<`void`\>

Defined in: core/jsonrpc/dist/node.d.ts:114

Emits an event to the remote end.

#### Type Parameters

##### K

`K` *extends* keyof [`RouterEventMap`](../interfaces/RouterEventMap.md)

#### Parameters

##### event

`K`

The name of the event to emit.

##### params

[`RouterEventMap`](../interfaces/RouterEventMap.md)\[`K`\]

The payload for the event.

#### Returns

`Promise`\<`void`\>

#### Inherited from

`JSONRPCNode.emit`

***

### getPermissions()

> `protected` **getPermissions**(`context`, `params`): `Promise`\<[`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)\>

Defined in: [core/router/src/router.ts:378](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/router.ts#L378)

Handles wm_getPermissions method to retrieve current permissions.
Returns permissions for specified chains or all chains if none specified.

#### Parameters

##### context

[`RouterContext`](../interfaces/RouterContext.md)

Router context with session information

##### params

Parameters including optional chain IDs to filter by

###### chainIds?

`string`[]

###### sessionId

`string`

#### Returns

`Promise`\<[`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)\>

Current permissions in human-readable format

#### Throws

With code 'invalidSession' if session is invalid

***

### getSupportedMethods()

> `protected` **getSupportedMethods**(`_context`, `params`): `Promise`\<`Record`\<`string`, `string`[]\>\>

Defined in: [core/router/src/router.ts:552](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/router.ts#L552)

Handles wm_getSupportedMethods method to discover available methods.
Returns router methods if no chains specified, otherwise returns
methods supported by specified chains.

#### Parameters

##### \_context

[`RouterContext`](../interfaces/RouterContext.md)

Router context (unused but required by interface)

##### params

Parameters including optional chain IDs to query

###### chainIds?

`string`[]

#### Returns

`Promise`\<`Record`\<`string`, `string`[]\>\>

Record mapping chain IDs to their supported method names

#### Throws

If chain validation fails or capability query fails

***

### notify()

> **notify**\<`M`\>(`method`, `params`): `Promise`\<`void`\>

Defined in: core/jsonrpc/dist/node.d.ts:99

Sends a JSON-RPC notification (a request without an ID, expecting no response).

#### Type Parameters

##### M

`M` *extends* keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)

#### Parameters

##### method

`M`

The name of the method for the notification.

##### params

[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"params"`\]

The parameters for the notification.

#### Returns

`Promise`\<`void`\>

#### Inherited from

`JSONRPCNode.notify`

***

### on()

> **on**\<`K`\>(`event`, `handler`): () => `void`

Defined in: core/jsonrpc/dist/node.d.ts:107

Registers an event handler for a specific event name.

#### Type Parameters

##### K

`K` *extends* keyof [`RouterEventMap`](../interfaces/RouterEventMap.md)

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

#### Inherited from

`JSONRPCNode.on`

***

### receiveMessage()

> **receiveMessage**(`message`): `Promise`\<`void`\>

Defined in: core/jsonrpc/dist/node.d.ts:130

Processes an incoming message from the transport.
This method is typically called by the transport's `onMessage` handler.
It validates the message and routes it to the appropriate handler (request, response, or event).

#### Parameters

##### message

`unknown`

The raw message received from the transport.

#### Returns

`Promise`\<`void`\>

#### Inherited from

`JSONRPCNode.receiveMessage`

***

### reconnect()

> `protected` **reconnect**(`context`, `params`): `Promise`\<\{ `permissions`: [`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md); `status`: `boolean`; \}\>

Defined in: [core/router/src/router.ts:308](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/router.ts#L308)

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

***

### registerMethod()

> **registerMethod**\<`M`\>(`name`, `handler`): `void`

Defined in: core/jsonrpc/dist/node.d.ts:73

Registers a method handler for a given method name.

#### Type Parameters

##### M

`M` *extends* keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)

#### Parameters

##### name

`Extract`\<`M`, `string`\>

The name of the method to register.

##### handler

(`context`, `params`) => `Promise`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

The asynchronous function to handle requests for this method.
                 It receives the context and method parameters, and should return the result.

#### Returns

`void`

#### Inherited from

`JSONRPCNode.registerMethod`

***

### registerSerializer()

> **registerSerializer**\<`M`\>(`method`, `serializer`): `void`

Defined in: core/jsonrpc/dist/node.d.ts:80

Registers a custom serializer for the parameters and/or result of a specific method.

#### Type Parameters

##### M

`M` *extends* keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)

#### Parameters

##### method

`M`

The name of the method for which to register the serializer.

##### serializer

`JSONRPCSerializer`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"params"`\], [`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

The serializer implementation for the method's parameters and/or result.

#### Returns

`void`

#### Inherited from

`JSONRPCNode.registerSerializer`

***

### removeWallet()

> **removeWallet**(`chainId`): `void`

Defined in: [core/router/src/router.ts:237](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/router.ts#L237)

Removes a wallet for a specific chain ID.

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

***

### setFallbackHandler()

> **setFallbackHandler**(`handler`): `void`

Defined in: core/jsonrpc/dist/node.d.ts:144

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

#### Inherited from

`JSONRPCNode.setFallbackHandler`

***

### updatePermissions()

> `protected` **updatePermissions**(`context`, `params`): `Promise`\<[`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)\>

Defined in: [core/router/src/router.ts:404](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/router.ts#L404)

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

***

### validateChain()

> `protected` **validateChain**(`chainId`): `JSONRPCProxy`

Defined in: [core/router/src/router.ts:183](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/router.ts#L183)

Validates a chain ID and returns its corresponding proxy.

#### Parameters

##### chainId

`string`

Chain ID to validate

#### Returns

`JSONRPCProxy`

The proxy instance for the specified chain

#### Throws

With code 'unknownChain' if the chain ID is not configured
