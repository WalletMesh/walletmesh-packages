[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletClient

# Interface: WalletClient

Public interface for wallet client implementations

## Remarks

Defines the public API for wallet clients used in modal configurations.
This interface provides access to wallet connection functionality without
exposing internal implementation details.

## Example

```typescript
const client: WalletClient = createWalletClient();
await client.initialize();

const connectionResult = await client.connect('metamask');
console.log('Connected:', connectionResult);

// Listen for events
const unsubscribe = client.on('accountsChanged', (accounts) => {
  console.log('New accounts:', accounts);
});
```

## Methods

### connect()

> **connect**(`walletId`, `options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`\>

Connect to a specific wallet

#### Parameters

##### walletId

`string`

Identifier of the wallet to connect to

##### options?

`unknown`

Optional connection configuration

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`\>

Promise that resolves to connection details

***

### disconnect()

> **disconnect**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Disconnect from the current wallet

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when disconnection is complete

***

### getConnectionInfo()

> **getConnectionInfo**(): `null` \| [`ConnectionInfo`](ConnectionInfo.md)

Get the current connection information

#### Returns

`null` \| [`ConnectionInfo`](ConnectionInfo.md)

Current connection details or null if not connected

***

### initialize()

> **initialize**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Initialize the wallet client

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when initialization is complete

***

### off()

> **off**(`event`, `listener`): `void`

Remove an event listener

#### Parameters

##### event

`string`

Event type to stop listening for

##### listener

[`EventListener`](../type-aliases/EventListener.md)

Function to remove

#### Returns

`void`

***

### on()

> **on**(`event`, `listener`): () => `void`

Register an event listener for wallet events

#### Parameters

##### event

`string`

Event type to listen for

##### listener

[`EventListener`](../type-aliases/EventListener.md)

Function to call when event occurs

#### Returns

Function to unsubscribe the listener

> (): `void`

##### Returns

`void`
