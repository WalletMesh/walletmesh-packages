[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / Transport

# Interface: Transport

Defined in: core/modal-core/dist/types.d.ts:888

Interface for transport implementations

## Remarks

Defines the API for communication transports.
All transports must implement this interface.

## Example

```typescript
// Create a WebSocket transport
const transport = createTransport(TransportType.WEBSOCKET, {
  url: 'wss://example.com/wallet'
});

// Connect to the transport
await transport.connect();

// Send data
await transport.send({ method: 'eth_requestAccounts' });

// Listen for responses
transport.on('message', (event) => {
  console.log('Received message:', event.data);
});

// Clean up when done
await transport.destroy();
```
 Transport

## Methods

### connect()

> **connect**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/types.d.ts:895

Connect to the transport

#### Returns

`Promise`\<`void`\>

A promise that resolves when the connection is established

#### Throws

If the connection fails

***

### destroy()

> **destroy**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/types.d.ts:936

Destroy the transport, cleaning up all resources

#### Returns

`Promise`\<`void`\>

A promise that resolves when all resources have been cleaned up

#### Remarks

This method should perform a complete cleanup of all resources associated with the transport,
including disconnecting if connected, removing all event listeners, and releasing any other
resources that might cause memory leaks. This should be called when the transport is no longer needed.

#### Throws

If cleanup fails

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/types.d.ts:901

Disconnect from the transport

#### Returns

`Promise`\<`void`\>

A promise that resolves when the disconnection is complete

***

### off()

> **off**(`event`, `listener`): `void`

Defined in: core/modal-core/dist/types.d.ts:924

Unsubscribe from transport events

#### Parameters

##### event

`string`

Event type to stop listening for

##### listener

(`event`) => `void`

Callback function to remove

#### Returns

`void`

***

### on()

> **on**(`event`, `listener`): () => `void`

Defined in: core/modal-core/dist/types.d.ts:917

Subscribe to transport events

#### Parameters

##### event

`string`

Event type to listen for

##### listener

(`event`) => `void`

Callback function to call when the event occurs

#### Returns

A function that can be called to unsubscribe

> (): `void`

##### Returns

`void`

***

### send()

> **send**(`data`): `Promise`\<`void`\>

Defined in: core/modal-core/dist/types.d.ts:909

Send data through the transport

#### Parameters

##### data

`unknown`

Data to send

#### Returns

`Promise`\<`void`\>

A promise that resolves when the data has been sent

#### Throws

If sending fails
