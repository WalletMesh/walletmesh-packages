[**@walletmesh/router v0.5.2**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / WalletRouterProvider

# Class: WalletRouterProvider

Defined in: [core/router/src/provider.ts:60](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/provider.ts#L60)

Client-side provider for interacting with the multi-chain router.
Provides a simplified interface for applications to connect to and interact with wallets.

The provider handles session management and method invocation, abstracting away
the underlying JSON-RPC communication details. It uses a bi-directional peer connection
to support both sending requests and receiving events from the router.

Events inherited from JSONRPCNode:
- wm_walletStateChanged: Emitted when wallet state changes (accounts, network, etc.)
- wm_permissionsChanged: Emitted when session permissions are updated
- wm_sessionTerminated: Emitted when the session is terminated
- wm_walletAvailabilityChanged: Emitted when wallet availability changes

## See

[RouterEventMap](../interfaces/RouterEventMap.md) for detailed event documentation

## Example

```typescript
const provider = new WalletRouterProvider({
  send: async (message) => {
    // Send message to router
    await fetch('/api/wallet', {
      method: 'POST',
      body: JSON.stringify(message)
    });
  }
});

// Connect to a chain
const { sessionId, permissions } = await provider.connect({
  'eip155:1': ['eth_accounts', 'eth_sendTransaction']
});

// Listen for wallet state changes
provider.on('wm_walletStateChanged', ({ chainId, changes }) => {
  console.log(`Wallet state changed for ${chainId}:`, changes);
});

// Call methods
const accounts = await provider.call('eip155:1', {
  method: 'eth_accounts'
});
```

## Extends

- `JSONRPCNode`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md), [`RouterEventMap`](../interfaces/RouterEventMap.md), [`RouterContext`](../interfaces/RouterContext.md)\>

## Constructors

### Constructor

> **new WalletRouterProvider**(`transport`, `context?`, `sessionId?`): `WalletRouterProvider`

Defined in: [core/router/src/provider.ts:71](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/provider.ts#L71)

Creates a new WalletRouterProvider instance.

#### Parameters

##### transport

`JSONRPCTransport`

The JSON-RPC transport for communication

##### context?

[`RouterContext`](../interfaces/RouterContext.md)

Optional context object for the JSON-RPC node

##### sessionId?

`string`

Optional pre-existing session ID to use without calling connect

#### Returns

`WalletRouterProvider`

#### Overrides

`JSONRPCNode<RouterMethodMap, RouterEventMap, RouterContext>.constructor`

## Properties

### context

> `readonly` **context**: [`RouterContext`](../interfaces/RouterContext.md)

Defined in: core/jsonrpc/dist/node.d.ts:63

#### Inherited from

`JSONRPCNode.context`

## Accessors

### sessionId

#### Get Signature

> **get** **sessionId**(): `undefined` \| `string`

Defined in: [core/router/src/provider.ts:87](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/provider.ts#L87)

Gets the current session ID if connected, undefined otherwise.
The session ID is required for most operations and is set after
a successful connection.

##### See

 - [connect](#connect) for establishing a session
 - [disconnect](#disconnect) for ending a session

##### Returns

`undefined` \| `string`

The current session ID or undefined if not connected

## Methods

### addMiddleware()

> **addMiddleware**(`middleware`): () => `void`

Defined in: core/jsonrpc/dist/node.d.ts:144

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

### bulkCall()

> **bulkCall**\<`T`\>(`chainId`, `calls`, `timeout?`): `Promise`\<[`MethodResults`](../type-aliases/MethodResults.md)\<`T`\>\>

Defined in: [core/router/src/provider.ts:398](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/provider.ts#L398)

Executes multiple method calls in sequence on the same chain.
More efficient than multiple individual calls for related operations.

#### Type Parameters

##### T

`T` *extends* readonly [`MethodCall`](../interfaces/MethodCall.md)\<keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)\>[]

#### Parameters

##### chainId

`string`

Target chain identifier (must match the chain ID used to connect)

##### calls

`T`

Array of method calls to execute

##### timeout?

`number`

Optional timeout in milliseconds. If the request takes longer,
                it will be cancelled and throw a TimeoutError

#### Returns

`Promise`\<[`MethodResults`](../type-aliases/MethodResults.md)\<`T`\>\>

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

***

### call()

> **call**\<`M`\>(`chainId`, `call`, `timeout?`): `Promise`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

Defined in: [core/router/src/provider.ts:244](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/provider.ts#L244)

Invokes a method on the connected wallet.
Routes the call to the appropriate wallet client based on chain ID.

#### Type Parameters

##### M

`M` *extends* keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)

#### Parameters

##### chainId

`string`

Target chain identifier (must match the chain ID used to connect)

##### call

[`MethodCall`](../interfaces/MethodCall.md)\<`M`\>

Method call details including name and parameters

##### timeout?

`number`

Optional timeout in milliseconds. If the request takes longer,
                it will be cancelled and throw a TimeoutError

#### Returns

`Promise`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

Result from the wallet method call with proper type inference

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
// Get accounts with proper type inference
const accounts = await provider.call('eip155:1', {
  method: 'eth_accounts'
} as const);

// Send transaction with proper type inference
const txHash = await provider.call('eip155:1', {
  method: 'eth_sendTransaction',
  params: [{
    to: '0x...',
    value: '0x...'
  }]
} as const);
```

***

### callMethod()

> **callMethod**\<`M`\>(`method`, `params?`, `timeoutInSeconds?`): `Promise`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

Defined in: core/jsonrpc/dist/node.d.ts:110

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

### chain()

> **chain**(`chainId`): [`OperationBuilder`](OperationBuilder.md)\<readonly \[\]\>

Defined in: [core/router/src/provider.ts:481](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/provider.ts#L481)

Creates a new operation builder for chaining method calls.
Enables fluent method call chaining with proper type inference.

#### Parameters

##### chainId

`string`

The chain to execute operations on

#### Returns

[`OperationBuilder`](OperationBuilder.md)\<readonly \[\]\>

A new operation builder instance

#### Example

```typescript
const [balance, code] = await provider
  .chain('eip155:1')
  .call('eth_getBalance', ['0x123...'])
  .call('eth_getCode', ['0x456...'])
  .execute();
```

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: core/jsonrpc/dist/node.d.ts:196

Closes the JSON-RPC node, cleaning up resources.
This includes removing all event handlers, middleware, and rejecting any pending requests.
The underlying transport is not closed by this method and should be managed separately.

#### Returns

`Promise`\<`void`\>

#### Inherited from

`JSONRPCNode.close`

***

### connect()

> **connect**(`permissions`, `timeout?`): `Promise`\<\{ `permissions`: [`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md); `sessionId`: `string`; \}\>

Defined in: [core/router/src/provider.ts:118](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/provider.ts#L118)

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

***

### disconnect()

> **disconnect**(`timeout?`): `Promise`\<`void`\>

Defined in: [core/router/src/provider.ts:137](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/provider.ts#L137)

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

***

### emit()

> **emit**\<`K`\>(`event`, `params`): `Promise`\<`void`\>

Defined in: core/jsonrpc/dist/node.d.ts:136

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

> **getPermissions**(`chainIds?`, `timeout?`): `Promise`\<[`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)\>

Defined in: [core/router/src/provider.ts:158](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/provider.ts#L158)

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

***

### getRegisteredMethods()

> **getRegisteredMethods**(): `string`[]

Defined in: core/jsonrpc/dist/node.d.ts:173

Gets the list of registered method names.
Used for capability discovery following the wm_getSupportedMethods pattern.

#### Returns

`string`[]

Array of registered method names as strings.

#### Inherited from

`JSONRPCNode.getRegisteredMethods`

***

### getSupportedMethods()

> **getSupportedMethods**(`chainIds?`, `timeout?`): `Promise`\<`Record`\<`string`, `string`[]\>\>

Defined in: [core/router/src/provider.ts:457](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/provider.ts#L457)

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

***

### notify()

> **notify**\<`M`\>(`method`, `params`): `Promise`\<`void`\>

Defined in: core/jsonrpc/dist/node.d.ts:121

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

Defined in: core/jsonrpc/dist/node.d.ts:129

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

Defined in: core/jsonrpc/dist/node.d.ts:152

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

### registerMethod()

> **registerMethod**\<`M`\>(`name`, `handler`): `void`

Defined in: core/jsonrpc/dist/node.d.ts:85

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

### registerMethodSerializer()

> **registerMethodSerializer**\<`P`, `R`\>(`method`, `serializer`): `void`

Defined in: [core/router/src/provider.ts:510](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/provider.ts#L510)

Registers a serializer for a specific wallet method.
This allows the provider to properly serialize parameters and deserialize results
for wallet methods before they are wrapped in wm_call.

#### Type Parameters

##### P

`P` = `unknown`

##### R

`R` = `unknown`

#### Parameters

##### method

`string`

The wallet method name (e.g., 'aztec_getAddress', 'eth_getBalance')

##### serializer

`JSONRPCSerializer`\<`P`, `R`\>

The serializer for the method

#### Returns

`void`

#### Example

```typescript
// Register a serializer for Aztec addresses
provider.registerMethodSerializer('aztec_getAddress', {
  result: {
    serialize: async (result) => ({ serialized: result.toString() }),
    deserialize: async (data) => AztecAddress.fromString(data.serialized)
  }
});

// Now calls to aztec_getAddress will automatically serialize/deserialize
const address = await provider.call('aztec:mainnet', {
  method: 'aztec_getAddress'
});
// address is properly typed as AztecAddress
```

***

### registerSerializer()

> **registerSerializer**\<`M`\>(`method`, `serializer`): `void`

Defined in: core/jsonrpc/dist/node.d.ts:95

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

### setFallbackHandler()

> **setFallbackHandler**(`handler`): `void`

Defined in: core/jsonrpc/dist/node.d.ts:166

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

> **updatePermissions**(`permissions`, `timeout?`): `Promise`\<[`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)\>

Defined in: [core/router/src/provider.ts:192](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/provider.ts#L192)

Updates session permissions.
Requests additional permissions or modifies existing ones.

#### Parameters

##### permissions

`Record`\<[`ChainId`](../type-aliases/ChainId.md), `string`[]\>

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
