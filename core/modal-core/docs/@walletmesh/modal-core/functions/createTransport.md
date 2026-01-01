[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createTransport

# Function: createTransport()

> **createTransport**\<`T`\>(`type`, `config?`): [`Transport`](../interfaces/Transport.md)

Create a transport instance

## Type Parameters

### T

`T` *extends* [`TransportConfig`](../interfaces/TransportConfig.md)

## Parameters

### type

[`TransportType`](../enumerations/TransportType.md)

Type of transport to create

### config?

`T`

Transport configuration

## Returns

[`Transport`](../interfaces/Transport.md)

A transport instance

## Throws

If configuration validation fails

## Example

```typescript
// Create a Popup transport
const transport = createTransport(TransportType.Popup, {
  url: 'https://example.com/wallet'
});

// Connect to the transport
await transport.connect();

// Send data
await transport.send({ method: 'eth_requestAccounts' });

// Listen for responses
transport.on('message', (event) => {
  console.log('Received message:', event.data);
});
```
