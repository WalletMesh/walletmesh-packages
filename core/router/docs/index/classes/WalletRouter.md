[**@walletmesh/router v0.4.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / WalletRouter

# Class: WalletRouter

Defined in: [core/router/src/router.ts:51](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/router.ts#L51)

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

Defined in: [core/router/src/router.ts:97](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/router.ts#L97)

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

## Properties

### context

> `readonly` **context**: [`RouterContext`](../interfaces/RouterContext.md)

Defined in: core/jsonrpc/dist/node.d.ts:4

#### Inherited from

`JSONRPCNode.context`

***

### sessionStore

> `protected` **sessionStore**: [`SessionStore`](../interfaces/SessionStore.md)

Defined in: [core/router/src/router.ts:56](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/router.ts#L56)

Store for managing session data persistence and lifecycle

## Methods

### \_call()

> `protected` **\_call**(`client`, `methodCall`): `Promise`\<`unknown`\>

Defined in: [core/router/src/router.ts:463](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/router.ts#L463)

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

***

### addMiddleware()

> **addMiddleware**(`middleware`): () => `void`

Defined in: core/jsonrpc/dist/node.d.ts:19

#### Parameters

##### middleware

`JSONRPCMiddleware`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md), [`RouterContext`](../interfaces/RouterContext.md)\>

#### Returns

`Function`

##### Returns

`void`

#### Inherited from

`JSONRPCNode.addMiddleware`

***

### addWallet()

> **addWallet**(`chainId`, `wallet`): `void`

Defined in: [core/router/src/router.ts:161](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/router.ts#L161)

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

***

### bulkCall()

> `protected` **bulkCall**(`_context`, `params`): `Promise`\<`unknown`[]\>

Defined in: [core/router/src/router.ts:513](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/router.ts#L513)

Handles wm_bulkCall method to execute multiple wallet methods.
Executes calls in sequence and handles partial failures.

#### Parameters

##### \_context

[`RouterContext`](../interfaces/RouterContext.md)

Router context (unused but required by interface)

##### params

Parameters including chain ID and array of method calls

###### calls

[`MethodCall`](../interfaces/MethodCall.md)[]

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

Defined in: [core/router/src/router.ts:493](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/router.ts#L493)

Handles wm_call method to execute a single wallet method.
Routes the call to appropriate wallet after validation.

#### Parameters

##### \_context

[`RouterContext`](../interfaces/RouterContext.md)

Router context (unused but required by interface)

##### params

Parameters including chain ID and method call details

###### call

[`MethodCall`](../interfaces/MethodCall.md)

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

> **callMethod**\<`M`\>(`method`, `params`?, `timeoutInSeconds`?): `Promise`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

Defined in: core/jsonrpc/dist/node.d.ts:15

#### Type Parameters

• **M** *extends* keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)

#### Parameters

##### method

`M`

##### params?

[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"params"`\]

##### timeoutInSeconds?

`number`

#### Returns

`Promise`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

#### Inherited from

`JSONRPCNode.callMethod`

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: core/jsonrpc/dist/node.d.ts:25

#### Returns

`Promise`\<`void`\>

#### Inherited from

`JSONRPCNode.close`

***

### connect()

> `protected` **connect**(`context`, `params`): `Promise`\<\{ `permissions`: [`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md); `sessionId`: `string`; \}\>

Defined in: [core/router/src/router.ts:230](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/router.ts#L230)

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

Defined in: [core/router/src/router.ts:370](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/router.ts#L370)

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

Defined in: core/jsonrpc/dist/node.d.ts:18

#### Type Parameters

• **K** *extends* keyof [`RouterEventMap`](../interfaces/RouterEventMap.md)

#### Parameters

##### event

`K`

##### params

[`RouterEventMap`](../interfaces/RouterEventMap.md)\[`K`\]

#### Returns

`Promise`\<`void`\>

#### Inherited from

`JSONRPCNode.emit`

***

### getPermissions()

> `protected` **getPermissions**(`context`, `params`): `Promise`\<[`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)\>

Defined in: [core/router/src/router.ts:407](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/router.ts#L407)

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

***

### getSupportedMethods()

> `protected` **getSupportedMethods**(`_context`, `params`): `Promise`\<`Record`\<`string`, `string`[]\>\>

Defined in: [core/router/src/router.ts:553](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/router.ts#L553)

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

***

### notify()

> **notify**\<`M`\>(`method`, `params`): `Promise`\<`void`\>

Defined in: core/jsonrpc/dist/node.d.ts:16

#### Type Parameters

• **M** *extends* keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)

#### Parameters

##### method

`M`

##### params

[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"params"`\]

#### Returns

`Promise`\<`void`\>

#### Inherited from

`JSONRPCNode.notify`

***

### on()

> **on**\<`K`\>(`event`, `handler`): () => `void`

Defined in: core/jsonrpc/dist/node.d.ts:17

#### Type Parameters

• **K** *extends* keyof [`RouterEventMap`](../interfaces/RouterEventMap.md)

#### Parameters

##### event

`K`

##### handler

(`params`) => `void`

#### Returns

`Function`

##### Returns

`void`

#### Inherited from

`JSONRPCNode.on`

***

### receiveMessage()

> **receiveMessage**(`message`): `Promise`\<`void`\>

Defined in: core/jsonrpc/dist/node.d.ts:20

#### Parameters

##### message

`unknown`

#### Returns

`Promise`\<`void`\>

#### Inherited from

`JSONRPCNode.receiveMessage`

***

### reconnect()

> `protected` **reconnect**(`context`, `params`): `Promise`\<\{ `permissions`: [`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md); `status`: `boolean`; \}\>

Defined in: [core/router/src/router.ts:337](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/router.ts#L337)

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

Defined in: core/jsonrpc/dist/node.d.ts:13

#### Type Parameters

• **M** *extends* keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)

#### Parameters

##### name

`Extract`\<`M`, `string`\>

##### handler

(`context`, `params`) => `Promise`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

#### Returns

`void`

#### Inherited from

`JSONRPCNode.registerMethod`

***

### registerSerializer()

> **registerSerializer**\<`M`\>(`method`, `serializer`): `void`

Defined in: core/jsonrpc/dist/node.d.ts:14

#### Type Parameters

• **M** *extends* keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)

#### Parameters

##### method

`M`

##### serializer

`JSONRPCSerializer`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"params"`\], [`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

#### Returns

`void`

#### Inherited from

`JSONRPCNode.registerSerializer`

***

### removeWallet()

> **removeWallet**(`chainId`): `void`

Defined in: [core/router/src/router.ts:192](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/router.ts#L192)

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

***

### setFallbackHandler()

> **setFallbackHandler**(`handler`): `void`

Defined in: core/jsonrpc/dist/node.d.ts:24

#### Parameters

##### handler

(`context`, `method`, `params`) => `Promise`\<`unknown`\>

#### Returns

`void`

#### Inherited from

`JSONRPCNode.setFallbackHandler`

***

### setFallbackSerializer()

> **setFallbackSerializer**(`serializer`): `void`

Defined in: core/jsonrpc/dist/node.d.ts:11

#### Parameters

##### serializer

`JSONRPCSerializer`\<`unknown`, `unknown`\>

#### Returns

`void`

#### Inherited from

`JSONRPCNode.setFallbackSerializer`

***

### setupWalletEventListeners()

> `protected` **setupWalletEventListeners**(`wallets`): `void`

Defined in: [core/router/src/router.ts:273](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/router.ts#L273)

Sets up event listeners for all wallet clients.
Handles wallet events like disconnects and forwards them to clients.

#### Parameters

##### wallets

[`Wallets`](../type-aliases/Wallets.md)

Map of chain IDs to wallet clients to setup listeners for

#### Returns

`void`

***

### updatePermissions()

> `protected` **updatePermissions**(`context`, `params`): `Promise`\<[`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)\>

Defined in: [core/router/src/router.ts:433](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/router.ts#L433)

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

> `protected` **validateChain**(`chainId`): [`WalletClient`](../interfaces/WalletClient.md)

Defined in: [core/router/src/router.ts:138](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/router.ts#L138)

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
