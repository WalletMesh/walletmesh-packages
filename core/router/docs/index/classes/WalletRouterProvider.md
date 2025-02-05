[**@walletmesh/router v0.4.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / WalletRouterProvider

# Class: WalletRouterProvider

Defined in: [core/router/src/provider.ts:61](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/provider.ts#L61)

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

### new WalletRouterProvider()

> **new WalletRouterProvider**(`transport`, `context`?): [`WalletRouterProvider`](WalletRouterProvider.md)

Defined in: core/jsonrpc/dist/node.d.ts:12

#### Parameters

##### transport

`JSONRPCTransport`

##### context?

[`RouterContext`](../interfaces/RouterContext.md)

#### Returns

[`WalletRouterProvider`](WalletRouterProvider.md)

#### Inherited from

`JSONRPCNode<RouterMethodMap, RouterEventMap, RouterContext>.constructor`

## Properties

### context

> `readonly` **context**: [`RouterContext`](../interfaces/RouterContext.md)

Defined in: core/jsonrpc/dist/node.d.ts:4

#### Inherited from

`JSONRPCNode.context`

## Accessors

### sessionId

#### Get Signature

> **get** **sessionId**(): `undefined` \| `string`

Defined in: [core/router/src/provider.ts:73](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/provider.ts#L73)

Gets the current session ID if connected, undefined otherwise.
The session ID is required for most operations and is set after
a successful connection.

##### See

 - [connect](WalletRouterProvider.md#connect) for establishing a session
 - [disconnect](WalletRouterProvider.md#disconnect) for ending a session

##### Returns

`undefined` \| `string`

The current session ID or undefined if not connected

## Methods

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

### bulkCall()

> **bulkCall**\<`T`\>(`chainId`, `calls`, `timeout`?): `Promise`\<[`MethodResults`](../type-aliases/MethodResults.md)\<`T`\>\>

Defined in: [core/router/src/provider.ts:278](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/provider.ts#L278)

Executes multiple method calls in sequence on the same chain.
More efficient than multiple individual calls for related operations.

#### Type Parameters

• **T** *extends* readonly [`MethodCall`](../interfaces/MethodCall.md)[]

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

> **call**\<`M`\>(`chainId`, `call`, `timeout`?): `Promise`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

Defined in: [core/router/src/provider.ts:230](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/provider.ts#L230)

Invokes a method on the connected wallet.
Routes the call to the appropriate wallet client based on chain ID.

#### Type Parameters

• **M** *extends* keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)

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

### chain()

> **chain**(`chainId`): [`OperationBuilder`](OperationBuilder.md)

Defined in: [core/router/src/provider.ts:347](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/provider.ts#L347)

Creates a new operation builder for chaining method calls.
Enables fluent method call chaining with proper type inference.

#### Parameters

##### chainId

`string`

The chain to execute operations on

#### Returns

[`OperationBuilder`](OperationBuilder.md)

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

Defined in: core/jsonrpc/dist/node.d.ts:25

#### Returns

`Promise`\<`void`\>

#### Inherited from

`JSONRPCNode.close`

***

### connect()

> **connect**(`permissions`, `timeout`?): `Promise`\<\{ `permissions`: [`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md); `sessionId`: `string`; \}\>

Defined in: [core/router/src/provider.ts:104](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/provider.ts#L104)

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

> **disconnect**(`timeout`?): `Promise`\<`void`\>

Defined in: [core/router/src/provider.ts:123](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/provider.ts#L123)

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

> **getPermissions**(`chainIds`?, `timeout`?): `Promise`\<[`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)\>

Defined in: [core/router/src/provider.ts:144](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/provider.ts#L144)

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

### getSupportedMethods()

> **getSupportedMethods**(`chainIds`?, `timeout`?): `Promise`\<`Record`\<`string`, `string`[]\>\>

Defined in: [core/router/src/provider.ts:323](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/provider.ts#L323)

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

### updatePermissions()

> **updatePermissions**(`permissions`, `timeout`?): `Promise`\<[`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)\>

Defined in: [core/router/src/provider.ts:178](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/provider.ts#L178)

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
