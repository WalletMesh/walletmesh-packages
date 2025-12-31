[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / TransportType

# Enumeration: TransportType

Transport types enum for wallet communication mechanisms

## Remarks

Defines the different ways the modal can communicate with wallet implementations.
Each transport type has specific configuration requirements and use cases.

## Example

```typescript
const transport = createTransport(TransportType.Popup, {
  url: 'https://wallet.example.com',
  width: 400,
  height: 600
});
```

## Enumeration Members

### Extension

> **Extension**: `"extension"`

Browser extension transport (Chrome, Firefox, etc.)

***

### Iframe

> **Iframe**: `"iframe"`

IFrame transport for embedded wallets

***

### Injected

> **Injected**: `"injected"`

Injected provider transport (e.g., window.ethereum)

***

### Popup

> **Popup**: `"popup"`

Popup window transport for web wallets

***

### WebSocket

> **WebSocket**: `"websocket"`

WebSocket transport for real-time communication
