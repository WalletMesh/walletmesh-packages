[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / TransportType

# Enumeration: TransportType

Defined in: core/modal-core/dist/core/types.d.ts:233

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

Defined in: core/modal-core/dist/core/types.d.ts:237

Browser extension transport (Chrome, Firefox, etc.)

***

### Iframe

> **Iframe**: `"iframe"`

Defined in: core/modal-core/dist/core/types.d.ts:243

IFrame transport for embedded wallets

***

### Injected

> **Injected**: `"injected"`

Defined in: core/modal-core/dist/core/types.d.ts:241

Injected provider transport (e.g., window.ethereum)

***

### Popup

> **Popup**: `"popup"`

Defined in: core/modal-core/dist/core/types.d.ts:235

Popup window transport for web wallets

***

### WebSocket

> **WebSocket**: `"websocket"`

Defined in: core/modal-core/dist/core/types.d.ts:239

WebSocket transport for real-time communication
