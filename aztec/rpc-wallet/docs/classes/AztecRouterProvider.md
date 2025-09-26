[**@walletmesh/aztec-rpc-wallet v0.5.4**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecRouterProvider

# Class: AztecRouterProvider

Defined in: [aztec/rpc-wallet/src/client/aztec-router-provider.ts:46](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-router-provider.ts#L46)

An extended [WalletRouterProvider](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/classes/WalletRouterProvider.md) specifically for Aztec network interactions.

This class automatically registers all necessary Aztec-specific type serializers
(e.g., for `AztecAddress`, `Fr`, `TxExecutionRequest`) upon instantiation.
This ensures that when dApps communicate with an Aztec wallet via this provider,
all Aztec types are correctly serialized for JSON-RPC transport and deserialized
back into their proper object instances on receipt.

It simplifies the setup for dApp developers, as they do not need to manually
register serializers for Aztec types.

## Example

```typescript
import { AztecRouterProvider, createAztecWallet } from '@walletmesh/aztec-rpc-wallet';
import { MyCustomTransport } from './my-custom-transport'; // Assuming a custom transport

// 1. Create a JSON-RPC transport
const transport = new MyCustomTransport();

// 2. Create the AztecRouterProvider instance
const provider = new AztecRouterProvider(transport);

// 3. Connect to the Aztec chain (e.g., testnet) and request permissions
await provider.connect({
  'aztec:testnet': ['aztec_getAddress', 'aztec_sendTx']
});

// 4. Create an AztecDappWallet instance using the provider
const wallet = await createAztecWallet(provider, 'aztec:testnet');

// Now, calls made through 'wallet' will automatically handle Aztec type serialization:
const address = await wallet.getAddress(); // AztecAddress instance
// const txRequest = ...;
// const txHash = await wallet.sendTx(await wallet.proveTx(txRequest)); // Tx, TxHash instances
```

## See

 - [WalletRouterProvider](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/classes/WalletRouterProvider.md) for the base class functionality.
 - [registerAztecSerializers](../functions/registerAztecSerializers.md) for the underlying serializer registration.
 - [AztecDappWallet](AztecDappWallet.md) which is typically used with this provider.

## Extends

- [`WalletRouterProvider`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/classes/WalletRouterProvider.md)

## Constructors

### Constructor

> **new AztecRouterProvider**(`transport`, `context?`): `AztecRouterProvider`

Defined in: [aztec/rpc-wallet/src/client/aztec-router-provider.ts:58](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-router-provider.ts#L58)

Constructs an instance of `AztecRouterProvider`.

Upon construction, it immediately registers all Aztec-specific serializers
with the underlying JSON-RPC node managed by the `WalletRouterProvider`.

#### Parameters

##### transport

[`JSONRPCTransport`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/interfaces/JSONRPCTransport.md)

The [JSONRPCTransport](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/interfaces/JSONRPCTransport.md) instance to be used for
                   communication between the dApp and the WalletRouter.

##### context?

`Record`\<`string`, `unknown`\>

Optional context object that can be passed to the
                 `WalletRouterProvider` constructor.

#### Returns

`AztecRouterProvider`

#### Overrides

`WalletRouterProvider.constructor`

## Properties

### context

> `readonly` **context**: `RouterContext`

Defined in: core/jsonrpc/dist/node.d.ts:51

#### Inherited from

`WalletRouterProvider.context`

## Accessors

### sessionId

#### Get Signature

> **get** **sessionId**(): `undefined` \| `string`

Defined in: core/router/dist/provider.d.ts:60

Gets the current session ID if connected, undefined otherwise.
The session ID is required for most operations and is set after
a successful connection.

##### See

 - [connect](#connect) for establishing a session
 - [disconnect](#disconnect) for ending a session

##### Returns

`undefined` \| `string`

The current session ID or undefined if not connected

#### Inherited from

`WalletRouterProvider.sessionId`

## Methods

### addMiddleware()

> **addMiddleware**(`middleware`): () => `void`

Defined in: core/jsonrpc/dist/node.d.ts:122

Adds a middleware function to the request processing chain.
Middleware functions can intercept and modify incoming requests and outgoing responses.

#### Parameters

##### middleware

[`JSONRPCMiddleware`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/type-aliases/JSONRPCMiddleware.md)\<[`RouterMethodMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md), `RouterContext`\>

The middleware function to add.

#### Returns

A function that, when called, will remove this middleware.

> (): `void`

##### Returns

`void`

#### Inherited from

`WalletRouterProvider.addMiddleware`

***

### bulkCall()

> **bulkCall**\<`T`\>(`chainId`, `calls`, `timeout?`): `Promise`\<[`MethodResults`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/type-aliases/MethodResults.md)\<`T`\>\>

Defined in: core/router/dist/provider.d.ts:201

Executes multiple method calls in sequence on the same chain.
More efficient than multiple individual calls for related operations.

#### Type Parameters

##### T

`T` *extends* readonly [`MethodCall`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/MethodCall.md)\<keyof [`RouterMethodMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md)\>[]

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

`Promise`\<[`MethodResults`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/type-aliases/MethodResults.md)\<`T`\>\>

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

[\['wm\_bulkCall'\]](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md) for detailed request/response types

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

#### Inherited from

`WalletRouterProvider.bulkCall`

***

### call()

> **call**\<`M`\>(`chainId`, `call`, `timeout?`): `Promise`\<[`RouterMethodMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

Defined in: core/router/dist/provider.d.ts:172

Invokes a method on the connected wallet.
Routes the call to the appropriate wallet client based on chain ID.

#### Type Parameters

##### M

`M` *extends* keyof [`RouterMethodMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md)

#### Parameters

##### chainId

`string`

Target chain identifier (must match the chain ID used to connect)

##### call

[`MethodCall`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/MethodCall.md)\<`M`\>

Method call details including name and parameters

##### timeout?

`number`

Optional timeout in milliseconds. If the request takes longer,
                it will be cancelled and throw a TimeoutError

#### Returns

`Promise`\<[`RouterMethodMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

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

[\['wm\_call'\]](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md) for detailed request/response types

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

#### Inherited from

`WalletRouterProvider.call`

***

### callMethod()

> **callMethod**\<`M`\>(`method`, `params?`, `timeoutInSeconds?`): `Promise`\<[`RouterMethodMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

Defined in: core/jsonrpc/dist/node.d.ts:92

Calls a remote JSON-RPC method.

#### Type Parameters

##### M

`M` *extends* keyof [`RouterMethodMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md)

#### Parameters

##### method

`M`

The name of the method to call.

##### params?

[`RouterMethodMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md)\[`M`\]\[`"params"`\]

The parameters for the method call.

##### timeoutInSeconds?

`number`

Optional timeout for the request in seconds. Defaults to 0 (no timeout).

#### Returns

`Promise`\<[`RouterMethodMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

A promise that resolves with the result of the method call.

#### Throws

If the request times out.

#### Throws

If the remote end returns an error.

#### Throws

If sending the request fails.

#### Inherited from

`WalletRouterProvider.callMethod`

***

### chain()

> **chain**(`chainId`): [`OperationBuilder`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/classes/OperationBuilder.md)\<readonly \[\]\>

Defined in: core/router/dist/provider.d.ts:244

Creates a new operation builder for chaining method calls.
Enables fluent method call chaining with proper type inference.

#### Parameters

##### chainId

`string`

The chain to execute operations on

#### Returns

[`OperationBuilder`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/classes/OperationBuilder.md)\<readonly \[\]\>

A new operation builder instance

#### Example

```typescript
const [balance, code] = await provider
  .chain('eip155:1')
  .call('eth_getBalance', ['0x123...'])
  .call('eth_getCode', ['0x456...'])
  .execute();
```

#### Inherited from

`WalletRouterProvider.chain`

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: core/jsonrpc/dist/node.d.ts:167

Closes the JSON-RPC node, cleaning up resources.
This includes removing all event handlers, middleware, and rejecting any pending requests.
The underlying transport is not closed by this method and should be managed separately.

#### Returns

`Promise`\<`void`\>

#### Inherited from

`WalletRouterProvider.close`

***

### connect()

> **connect**(`permissions`, `timeout?`): `Promise`\<\{ `permissions`: [`HumanReadableChainPermissions`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/type-aliases/HumanReadableChainPermissions.md); `sessionId`: `string`; \}\>

Defined in: core/router/dist/provider.d.ts:88

Connects to multiple chains with specified permissions.
Establishes a session and requests method permissions for each chain.

#### Parameters

##### permissions

[`ChainPermissions`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/type-aliases/ChainPermissions.md)

Map of chain IDs to their requested permissions

##### timeout?

`number`

Optional timeout in milliseconds. If the request takes longer,
                it will be cancelled and throw a TimeoutError

#### Returns

`Promise`\<\{ `permissions`: [`HumanReadableChainPermissions`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/type-aliases/HumanReadableChainPermissions.md); `sessionId`: `string`; \}\>

Session ID that can be used for future requests

#### Throws

With code 'invalidRequest' if permissions are invalid

#### Throws

With code 'unknownChain' if a chain is not supported

#### Throws

If the request times out

#### See

[\['wm\_connect'\]](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md) for detailed request/response types

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

#### Inherited from

`WalletRouterProvider.connect`

***

### disconnect()

> **disconnect**(`timeout?`): `Promise`\<`void`\>

Defined in: core/router/dist/provider.d.ts:102

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

[\['wm\_disconnect'\]](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md) for detailed request/response types

#### Inherited from

`WalletRouterProvider.disconnect`

***

### emit()

> **emit**\<`K`\>(`event`, `params`): `Promise`\<`void`\>

Defined in: core/jsonrpc/dist/node.d.ts:114

Emits an event to the remote end.

#### Type Parameters

##### K

`K` *extends* keyof [`RouterEventMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterEventMap.md)

#### Parameters

##### event

`K`

The name of the event to emit.

##### params

[`RouterEventMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterEventMap.md)\[`K`\]

The payload for the event.

#### Returns

`Promise`\<`void`\>

#### Inherited from

`WalletRouterProvider.emit`

***

### getPermissions()

> **getPermissions**(`chainIds?`, `timeout?`): `Promise`\<[`HumanReadableChainPermissions`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/type-aliases/HumanReadableChainPermissions.md)\>

Defined in: core/router/dist/provider.d.ts:116

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

`Promise`\<[`HumanReadableChainPermissions`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/type-aliases/HumanReadableChainPermissions.md)\>

Record of chain IDs to their permissions with human-readable descriptions

#### Throws

With code 'invalidSession' if not connected

#### Throws

If the request times out

#### See

 - [HumanReadableChainPermissions](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/type-aliases/HumanReadableChainPermissions.md) for return type details
 - [\['wm\_getPermissions'\]](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md) for detailed request/response types

#### Inherited from

`WalletRouterProvider.getPermissions`

***

### getSupportedMethods()

> **getSupportedMethods**(`chainIds?`, `timeout?`): `Promise`\<`Record`\<`string`, `string`[]\>\>

Defined in: core/router/dist/provider.d.ts:227

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

[\['wm\_getSupportedMethods'\]](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md) for detailed request/response types

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

#### Inherited from

`WalletRouterProvider.getSupportedMethods`

***

### notify()

> **notify**\<`M`\>(`method`, `params`): `Promise`\<`void`\>

Defined in: core/jsonrpc/dist/node.d.ts:99

Sends a JSON-RPC notification (a request without an ID, expecting no response).

#### Type Parameters

##### M

`M` *extends* keyof [`RouterMethodMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md)

#### Parameters

##### method

`M`

The name of the method for the notification.

##### params

[`RouterMethodMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md)\[`M`\]\[`"params"`\]

The parameters for the notification.

#### Returns

`Promise`\<`void`\>

#### Inherited from

`WalletRouterProvider.notify`

***

### on()

> **on**\<`K`\>(`event`, `handler`): () => `void`

Defined in: core/jsonrpc/dist/node.d.ts:107

Registers an event handler for a specific event name.

#### Type Parameters

##### K

`K` *extends* keyof [`RouterEventMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterEventMap.md)

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

`WalletRouterProvider.on`

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

`WalletRouterProvider.receiveMessage`

***

### registerMethod()

> **registerMethod**\<`M`\>(`name`, `handler`): `void`

Defined in: core/jsonrpc/dist/node.d.ts:73

Registers a method handler for a given method name.

#### Type Parameters

##### M

`M` *extends* keyof [`RouterMethodMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md)

#### Parameters

##### name

`Extract`\<`M`, `string`\>

The name of the method to register.

##### handler

(`context`, `params`) => `Promise`\<[`RouterMethodMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

The asynchronous function to handle requests for this method.
                 It receives the context and method parameters, and should return the result.

#### Returns

`void`

#### Inherited from

`WalletRouterProvider.registerMethod`

***

### registerMethodSerializer()

> **registerMethodSerializer**\<`P`, `R`\>(`method`, `serializer`): `void`

Defined in: core/router/dist/provider.d.ts:270

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

[`JSONRPCSerializer`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/interfaces/JSONRPCSerializer.md)\<`P`, `R`\>

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

#### Inherited from

`WalletRouterProvider.registerMethodSerializer`

***

### registerSerializer()

> **registerSerializer**\<`M`\>(`method`, `serializer`): `void`

Defined in: core/jsonrpc/dist/node.d.ts:80

Registers a custom serializer for the parameters and/or result of a specific method.

#### Type Parameters

##### M

`M` *extends* keyof [`RouterMethodMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md)

#### Parameters

##### method

`M`

The name of the method for which to register the serializer.

##### serializer

[`JSONRPCSerializer`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/interfaces/JSONRPCSerializer.md)\<[`RouterMethodMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md)\[`M`\]\[`"params"`\], [`RouterMethodMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md)\[`M`\]\[`"result"`\]\>

The serializer implementation for the method's parameters and/or result.

#### Returns

`void`

#### Inherited from

`WalletRouterProvider.registerSerializer`

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

`WalletRouterProvider.setFallbackHandler`

***

### updatePermissions()

> **updatePermissions**(`permissions`, `timeout?`): `Promise`\<[`HumanReadableChainPermissions`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/type-aliases/HumanReadableChainPermissions.md)\>

Defined in: core/router/dist/provider.d.ts:138

Updates session permissions.
Requests additional permissions or modifies existing ones.

#### Parameters

##### permissions

`Record`\<`ChainId`, `string`[]\>

Record of chain IDs to their new permissions

##### timeout?

`number`

Optional timeout in milliseconds. If the request takes longer,
                it will be cancelled and throw a TimeoutError

#### Returns

`Promise`\<[`HumanReadableChainPermissions`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/type-aliases/HumanReadableChainPermissions.md)\>

#### Throws

With code 'invalidSession' if not connected

#### Throws

With code 'invalidRequest' if permissions are invalid

#### Throws

If the request times out

#### See

[\['wm\_updatePermissions'\]](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router/docs/index/interfaces/RouterMethodMap.md) for detailed request/response types

#### Example

```typescript
// Update permissions for multiple chains
await provider.updatePermissions({
  'eip155:1': ['eth_accounts', 'eth_sendTransaction'],
  'eip155:137': ['eth_getBalance', 'eth_call']
});
```

#### Inherited from

`WalletRouterProvider.updatePermissions`
