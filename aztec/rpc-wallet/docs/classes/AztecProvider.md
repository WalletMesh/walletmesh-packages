[**@walletmesh/aztec-rpc-wallet v0.3.0**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecProvider

# Class: AztecProvider

Defined in: [aztec/rpc-wallet/src/provider.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/provider.ts#L48)

Provider for interacting with multiple Aztec chains through WalletMesh router.

This class implements the client-side interface for dApps to communicate with Aztec wallets.
It handles:
- Connection management for multiple chains
- Session tracking
- Method calls with proper context
- Event handling for wallet state changes

## Example

```typescript
// Create provider with transport
const provider = new AztecProvider(transport);

// Connect to chains
await provider.connect(['aztec:testnet', 'aztec:devnet']);

// Single operation using convenience method
const address = await provider.getAccount('aztec:testnet');

// Single operation using chain builder
const txHash = await provider.chain('aztec:testnet')
  .call('aztec_sendTransaction', {
    functionCalls: [{
      contractAddress: "0x...",
      functionName: "transfer",
      args: [recipient, amount]
    }]
  })
  .execute();

// Multiple operations in one call
const [account, contracts, blockNumber] = await provider
  .chain('aztec:testnet')
  .call('aztec_getAccount')
  .call('aztec_getContracts')
  .call('aztec_getBlockNumber')
  .execute();
```

## Extends

- `WalletRouterProvider`

## Constructors

### new AztecProvider()

> **new AztecProvider**(`transport`): [`AztecProvider`](AztecProvider.md)

Defined in: [aztec/rpc-wallet/src/provider.ts:52](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/provider.ts#L52)

#### Parameters

##### transport

`JSONRPCTransport`

#### Returns

[`AztecProvider`](AztecProvider.md)

#### Overrides

`WalletRouterProvider.constructor`

## Properties

### context

> `readonly` **context**: `RouterContext`

Defined in: core/jsonrpc/dist/node.d.ts:4

#### Inherited from

`WalletRouterProvider.context`

## Accessors

### sessionId

#### Get Signature

> **get** **sessionId**(): `undefined` \| `string`

Defined in: core/router/dist/provider.d.ts:59

Gets the current session ID if connected, undefined otherwise.
The session ID is required for most operations and is set after
a successful connection.

##### See

 - [connect](AztecProvider.md#connect) for establishing a session
 - [disconnect](AztecProvider.md#disconnect) for ending a session

##### Returns

`undefined` \| `string`

The current session ID or undefined if not connected

#### Inherited from

`WalletRouterProvider.sessionId`

## Methods

### addMiddleware()

> **addMiddleware**(`middleware`): () => `void`

Defined in: core/jsonrpc/dist/node.d.ts:19

#### Parameters

##### middleware

`JSONRPCMiddleware`\<`RouterMethodMap`, `RouterContext`\>

#### Returns

`Function`

##### Returns

`void`

#### Inherited from

`WalletRouterProvider.addMiddleware`

***

### bulkCall()

> **bulkCall**\<`T`\>(`chainId`, `calls`, `timeout`?): `Promise`\<`MethodResults`\<`T`\>\>

Defined in: core/router/dist/provider.d.ts:200

Executes multiple method calls in sequence on the same chain.
More efficient than multiple individual calls for related operations.

#### Type Parameters

• **T** *extends* readonly `MethodCall`[]

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

`Promise`\<`MethodResults`\<`T`\>\>

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

RouterMethodMap\['wm\_bulkCall'\] for detailed request/response types

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

> **call**\<`M`\>(`chainId`, `call`, `timeout`?): `Promise`\<`RouterMethodMap`\[`M`\]\[`"result"`\]\>

Defined in: core/router/dist/provider.d.ts:171

Invokes a method on the connected wallet.
Routes the call to the appropriate wallet client based on chain ID.

#### Type Parameters

• **M** *extends* keyof `RouterMethodMap`

#### Parameters

##### chainId

`string`

Target chain identifier (must match the chain ID used to connect)

##### call

`MethodCall`\<`M`\>

Method call details including name and parameters

##### timeout?

`number`

Optional timeout in milliseconds. If the request takes longer,
                it will be cancelled and throw a TimeoutError

#### Returns

`Promise`\<`RouterMethodMap`\[`M`\]\[`"result"`\]\>

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

RouterMethodMap\['wm\_call'\] for detailed request/response types

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

> **callMethod**\<`M`\>(`method`, `params`?, `timeoutInSeconds`?): `Promise`\<`RouterMethodMap`\[`M`\]\[`"result"`\]\>

Defined in: core/jsonrpc/dist/node.d.ts:15

#### Type Parameters

• **M** *extends* keyof `RouterMethodMap`

#### Parameters

##### method

`M`

##### params?

`RouterMethodMap`\[`M`\]\[`"params"`\]

##### timeoutInSeconds?

`number`

#### Returns

`Promise`\<`RouterMethodMap`\[`M`\]\[`"result"`\]\>

#### Inherited from

`WalletRouterProvider.callMethod`

***

### chain()

> **chain**(`chainId`): `OperationBuilder`

Defined in: core/router/dist/provider.d.ts:243

Creates a new operation builder for chaining method calls.
Enables fluent method call chaining with proper type inference.

#### Parameters

##### chainId

`string`

The chain to execute operations on

#### Returns

`OperationBuilder`

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

Defined in: core/jsonrpc/dist/node.d.ts:25

#### Returns

`Promise`\<`void`\>

#### Inherited from

`WalletRouterProvider.close`

***

### connect()

> **connect**(`permissions`, `timeout`?): `Promise`\<\{ `permissions`: `HumanReadableChainPermissions`; `sessionId`: `string`; \}\>

Defined in: core/router/dist/provider.d.ts:87

Connects to multiple chains with specified permissions.
Establishes a session and requests method permissions for each chain.

#### Parameters

##### permissions

`ChainPermissions`

Map of chain IDs to their requested permissions

##### timeout?

`number`

Optional timeout in milliseconds. If the request takes longer,
                it will be cancelled and throw a TimeoutError

#### Returns

`Promise`\<\{ `permissions`: `HumanReadableChainPermissions`; `sessionId`: `string`; \}\>

Session ID that can be used for future requests

#### Throws

With code 'invalidRequest' if permissions are invalid

#### Throws

With code 'unknownChain' if a chain is not supported

#### Throws

If the request times out

#### See

RouterMethodMap\['wm\_connect'\] for detailed request/response types

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

> **disconnect**(`timeout`?): `Promise`\<`void`\>

Defined in: core/router/dist/provider.d.ts:101

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

RouterMethodMap\['wm\_disconnect'\] for detailed request/response types

#### Inherited from

`WalletRouterProvider.disconnect`

***

### emit()

> **emit**\<`K`\>(`event`, `params`): `Promise`\<`void`\>

Defined in: core/jsonrpc/dist/node.d.ts:18

#### Type Parameters

• **K** *extends* keyof `RouterEventMap`

#### Parameters

##### event

`K`

##### params

`RouterEventMap`\[`K`\]

#### Returns

`Promise`\<`void`\>

#### Inherited from

`WalletRouterProvider.emit`

***

### getAccount()

> **getAccount**(`chainId`): `Promise`\<`string`\>

Defined in: [aztec/rpc-wallet/src/provider.ts:110](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/provider.ts#L110)

#### Parameters

##### chainId

`` `aztec:${string}` ``

#### Returns

`Promise`\<`string`\>

***

### getPermissions()

> **getPermissions**(`chainIds`?, `timeout`?): `Promise`\<`HumanReadableChainPermissions`\>

Defined in: core/router/dist/provider.d.ts:115

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

`Promise`\<`HumanReadableChainPermissions`\>

Record of chain IDs to their permissions with human-readable descriptions

#### Throws

With code 'invalidSession' if not connected

#### Throws

If the request times out

#### See

 - HumanReadableChainPermissions for return type details
 - RouterMethodMap\['wm\_getPermissions'\] for detailed request/response types

#### Inherited from

`WalletRouterProvider.getPermissions`

***

### getSupportedChains()

> **getSupportedChains**(): `` `aztec:${string}` ``[]

Defined in: [aztec/rpc-wallet/src/provider.ts:106](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/provider.ts#L106)

Gets the list of currently connected chain IDs.

#### Returns

`` `aztec:${string}` ``[]

Array of connected chain IDs

***

### getSupportedMethods()

> **getSupportedMethods**(`chainIds`?, `timeout`?): `Promise`\<`Record`\<`string`, `string`[]\>\>

Defined in: core/router/dist/provider.d.ts:226

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

RouterMethodMap\['wm\_getSupportedMethods'\] for detailed request/response types

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

Defined in: core/jsonrpc/dist/node.d.ts:16

#### Type Parameters

• **M** *extends* keyof `RouterMethodMap`

#### Parameters

##### method

`M`

##### params

`RouterMethodMap`\[`M`\]\[`"params"`\]

#### Returns

`Promise`\<`void`\>

#### Inherited from

`WalletRouterProvider.notify`

***

### on()

> **on**\<`K`\>(`event`, `handler`): () => `void`

Defined in: core/jsonrpc/dist/node.d.ts:17

#### Type Parameters

• **K** *extends* keyof `RouterEventMap`

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

`WalletRouterProvider.on`

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

`WalletRouterProvider.receiveMessage`

***

### registerContract()

> **registerContract**(`chainId`, `params`): `Promise`\<`void`\>

Defined in: [aztec/rpc-wallet/src/provider.ts:157](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/provider.ts#L157)

Registers a contract instance with the wallet.

#### Parameters

##### chainId

`` `aztec:${string}` ``

ID of the chain where contract is deployed

##### params

Contract registration parameters

###### artifact

`ContractArtifact`

###### instance

`ContractInstanceWithAddress`

#### Returns

`Promise`\<`void`\>

#### Throws

If registration fails

***

### registerContractClass()

> **registerContractClass**(`chainId`, `params`): `Promise`\<`void`\>

Defined in: [aztec/rpc-wallet/src/provider.ts:170](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/provider.ts#L170)

Registers a contract class with the wallet.

#### Parameters

##### chainId

`` `aztec:${string}` ``

ID of the chain to register on

##### params

Contract class registration parameters

###### artifact

`ContractArtifact`

#### Returns

`Promise`\<`void`\>

#### Throws

If registration fails

***

### registerMethod()

> **registerMethod**\<`M`\>(`name`, `handler`): `void`

Defined in: core/jsonrpc/dist/node.d.ts:13

#### Type Parameters

• **M** *extends* keyof `RouterMethodMap`

#### Parameters

##### name

`Extract`\<`M`, `string`\>

##### handler

(`context`, `params`) => `Promise`\<`RouterMethodMap`\[`M`\]\[`"result"`\]\>

#### Returns

`void`

#### Inherited from

`WalletRouterProvider.registerMethod`

***

### registerSender()

> **registerSender**(`chainId`, `params`): `Promise`\<`void`\>

Defined in: [aztec/rpc-wallet/src/provider.ts:183](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/provider.ts#L183)

Registers a transaction sender with the wallet.

#### Parameters

##### chainId

`` `aztec:${string}` ``

ID of the chain to register on

##### params

Sender registration parameters

###### sender

`AztecAddress`

#### Returns

`Promise`\<`void`\>

#### Throws

If registration fails

***

### registerSerializer()

> **registerSerializer**\<`M`\>(`method`, `serializer`): `void`

Defined in: core/jsonrpc/dist/node.d.ts:14

#### Type Parameters

• **M** *extends* keyof `RouterMethodMap`

#### Parameters

##### method

`M`

##### serializer

`JSONRPCSerializer`\<`RouterMethodMap`\[`M`\]\[`"params"`\], `RouterMethodMap`\[`M`\]\[`"result"`\]\>

#### Returns

`void`

#### Inherited from

`WalletRouterProvider.registerSerializer`

***

### sendTransaction()

> **sendTransaction**(`chainId`, `params`): `Promise`\<`string`\>

Defined in: [aztec/rpc-wallet/src/provider.ts:125](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/provider.ts#L125)

Sends a transaction to the specified chain.

#### Parameters

##### chainId

`` `aztec:${string}` ``

ID of the chain to send transaction to

##### params

[`TransactionParams`](../type-aliases/TransactionParams.md)

Transaction parameters including function calls and optional auth witnesses

#### Returns

`Promise`\<`string`\>

Transaction hash

#### Throws

If transaction fails or response invalid

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

`WalletRouterProvider.setFallbackHandler`

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

`WalletRouterProvider.setFallbackSerializer`

***

### simulateTransaction()

> **simulateTransaction**(`chainId`, `params`): `Promise`\<`unknown`\>

Defined in: [aztec/rpc-wallet/src/provider.ts:140](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/provider.ts#L140)

Simulates a transaction without submitting it.

#### Parameters

##### chainId

`` `aztec:${string}` ``

ID of the chain to simulate on

##### params

[`TransactionFunctionCall`](../type-aliases/TransactionFunctionCall.md)

Transaction parameters to simulate

#### Returns

`Promise`\<`unknown`\>

Simulation result

#### Throws

If simulation fails

***

### updatePermissions()

> **updatePermissions**(`permissions`, `timeout`?): `Promise`\<`HumanReadableChainPermissions`\>

Defined in: core/router/dist/provider.d.ts:137

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

`Promise`\<`HumanReadableChainPermissions`\>

#### Throws

With code 'invalidSession' if not connected

#### Throws

With code 'invalidRequest' if permissions are invalid

#### Throws

If the request times out

#### See

RouterMethodMap\['wm\_updatePermissions'\] for detailed request/response types

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
