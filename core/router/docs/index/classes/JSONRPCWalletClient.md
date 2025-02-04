[**@walletmesh/router v0.3.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / JSONRPCWalletClient

# Class: JSONRPCWalletClient\<M, E, C\>

Defined in: [core/router/src/jsonrpc-adapter.ts:66](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/jsonrpc-adapter.ts#L66)

Adapter class that wraps a JSONRPCNode to implement the WalletClient interface.
This adapter allows any JSON-RPC peer to be used as a wallet client by
translating between the JSON-RPC protocol and the WalletClient interface.

The adapter supports both method calls and event handling, making it suitable
for modern wallets that require bi-directional communication.

## Example

```typescript
const node = new JSONRPCNode({
  send: message => {
    // Send to wallet
    wallet.postMessage(message);
  }
});

const walletClient = new JSONRPCWalletClient(node);

// Listen for account changes
walletClient.on('accountsChanged', accounts => {
  console.log('Active accounts:', accounts);
});

// Call methods
const accounts = await walletClient.call('eth_accounts');
const balance = await walletClient.call('eth_getBalance', [accounts[0]]);
```

## Type Parameters

• **M** *extends* [`WalletMethodMap`](../interfaces/WalletMethodMap.md) = [`WalletMethodMap`](../interfaces/WalletMethodMap.md)

• **E** *extends* `JSONRPCEventMap` = `JSONRPCEventMap`

• **C** *extends* `JSONRPCContext` = `JSONRPCContext`

## Implements

- [`WalletClient`](../interfaces/WalletClient.md)

## Constructors

### new JSONRPCWalletClient()

> **new JSONRPCWalletClient**\<`M`, `E`, `C`\>(`node`): [`JSONRPCWalletClient`](JSONRPCWalletClient.md)\<`M`, `E`, `C`\>

Defined in: [core/router/src/jsonrpc-adapter.ts:75](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/jsonrpc-adapter.ts#L75)

#### Parameters

##### node

`JSONRPCNode`\<`M`, `E`, `C`\>

#### Returns

[`JSONRPCWalletClient`](JSONRPCWalletClient.md)\<`M`, `E`, `C`\>

## Methods

### call()

> **call**\<`T`\>(`method`, `params`?): `Promise`\<`T`\>

Defined in: [core/router/src/jsonrpc-adapter.ts:95](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/jsonrpc-adapter.ts#L95)

Calls a method on the underlying JSON-RPC client

#### Type Parameters

• **T** = `unknown`

#### Parameters

##### method

`string`

The method name to call

##### params?

`unknown`

Optional parameters to pass to the method

#### Returns

`Promise`\<`T`\>

Promise resolving to the method result

#### Throws

If the method call fails or returns an error

#### Example

```typescript
// Call without parameters
const accounts = await client.call('eth_accounts');

// Call with parameters
const balance = await client.call('eth_getBalance', ['0x...', 'latest']);
```

#### Implementation of

[`WalletClient`](../interfaces/WalletClient.md).[`call`](../interfaces/WalletClient.md#call)

***

### getSupportedMethods()

> **getSupportedMethods**(): `Promise`\<`string`[]\>

Defined in: [core/router/src/jsonrpc-adapter.ts:116](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/jsonrpc-adapter.ts#L116)

Gets the capabilities (supported methods) of the wallet

#### Returns

`Promise`\<`string`[]\>

Promise resolving to an object containing an array of supported method names

#### Throws

If the capabilities request fails

#### Example

```typescript
const methods = await client.getSupportedMethods();
console.log('Supported methods:', methods);
```

#### Implementation of

[`WalletClient`](../interfaces/WalletClient.md).[`getSupportedMethods`](../interfaces/WalletClient.md#getsupportedmethods)

***

### off()

> **off**(`event`, `handler`): `void`

Defined in: [core/router/src/jsonrpc-adapter.ts:163](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/jsonrpc-adapter.ts#L163)

Remove a previously registered event handler

#### Parameters

##### event

`string`

Event name to stop listening for

##### handler

(`data`) => `void`

Handler function to remove (must be the same reference as used in 'on')

#### Returns

`void`

#### Example

```typescript
const handler = (accounts: string[]) => {
  console.log('Active accounts:', accounts);
};

// Start listening
client.on('accountsChanged', handler);

// Stop listening
client.off('accountsChanged', handler);
```

#### Implementation of

[`WalletClient`](../interfaces/WalletClient.md).[`off`](../interfaces/WalletClient.md#off)

***

### on()

> **on**(`event`, `handler`): `void`

Defined in: [core/router/src/jsonrpc-adapter.ts:136](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/jsonrpc-adapter.ts#L136)

Register an event handler for wallet events

#### Parameters

##### event

`string`

Event name to listen for (e.g., 'accountsChanged', 'networkChanged')

##### handler

(`data`) => `void`

Function to call when the event occurs

#### Returns

`void`

#### Example

```typescript
client.on('accountsChanged', (accounts: string[]) => {
  console.log('Active accounts:', accounts);
});

client.on('networkChanged', (networkId: string) => {
  console.log('Connected to network:', networkId);
});
```

#### Implementation of

[`WalletClient`](../interfaces/WalletClient.md).[`on`](../interfaces/WalletClient.md#on)
