[**@walletmesh/modal v0.0.5**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/transports/types](../README.md) / TransportType

# Enumeration: TransportType

Defined in: [core/modal/src/lib/transports/types.ts:214](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/transports/types.ts#L214)

Supported transport mechanisms for wallet communication.

Each type represents a different communication strategy:

- PostMessage: For secure cross-origin communication between windows/frames
  Ideal for wallet interfaces in popups or iframes

- WebSocket: For real-time bi-directional communication
  Suitable for remote wallet connections

- Extension: For communication with browser extensions
  Used when wallet functionality is provided via extension

- Null: No-op implementation for testing
  Useful for development and testing scenarios

## Enumeration Members

### PostMessage

> **PostMessage**: `"postMessage"`

Defined in: [core/modal/src/lib/transports/types.ts:215](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/transports/types.ts#L215)

***

### WebSocket

> **WebSocket**: `"websocket"`

Defined in: [core/modal/src/lib/transports/types.ts:216](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/transports/types.ts#L216)

***

### Extension

> **Extension**: `"extension"`

Defined in: [core/modal/src/lib/transports/types.ts:217](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/transports/types.ts#L217)

***

### Null

> **Null**: `"null"`

Defined in: [core/modal/src/lib/transports/types.ts:218](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/transports/types.ts#L218)
