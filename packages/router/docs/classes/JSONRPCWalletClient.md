[**@walletmesh/router v0.2.2**](../README.md)

***

[@walletmesh/router](../globals.md) / JSONRPCWalletClient

# Class: JSONRPCWalletClient\<M\>

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

## Implements

- [`WalletClient`](../interfaces/WalletClient.md)

## Constructors

### new JSONRPCWalletClient()

> **new JSONRPCWalletClient**\<`M`\>(`node`): [`JSONRPCWalletClient`](JSONRPCWalletClient.md)\<`M`\>

#### Parameters

##### node

`JSONRPCNode`\<`M`\>

#### Returns

[`JSONRPCWalletClient`](JSONRPCWalletClient.md)\<`M`\>

#### Defined in

[packages/router/src/jsonrpc-adapter.ts:64](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/router/src/jsonrpc-adapter.ts#L64)

## Methods

### call()

> **call**\<`T`\>(`method`, `params`?): `Promise`\<`T`\>

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

#### Defined in

[packages/router/src/jsonrpc-adapter.ts:84](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/router/src/jsonrpc-adapter.ts#L84)

***

### getSupportedMethods()

> **getSupportedMethods**(): `Promise`\<`string`[]\>

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

#### Defined in

[packages/router/src/jsonrpc-adapter.ts:105](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/router/src/jsonrpc-adapter.ts#L105)

***

### off()

> **off**(`event`, `handler`): `void`

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

#### Defined in

[packages/router/src/jsonrpc-adapter.ts:152](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/router/src/jsonrpc-adapter.ts#L152)

***

### on()

> **on**(`event`, `handler`): `void`

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

#### Defined in

[packages/router/src/jsonrpc-adapter.ts:125](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/router/src/jsonrpc-adapter.ts#L125)
