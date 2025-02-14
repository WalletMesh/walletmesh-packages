[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/transports/types](../README.md) / TransportOptions

# Interface: TransportOptions

Defined in: [core/modal/src/lib/transports/types.ts:256](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/transports/types.ts#L256)

Configuration options for transport initialization.

Provides a unified interface for configuring different transport types.
Each transport implementation uses the relevant options for its type.

## Remarks

Option requirements vary by transport type:
- PostMessage: Requires origin for security
- WebSocket: Requires URL for connection
- Extension: Requires extensionId for communication
- Null: No options required

## Example

```typescript
// PostMessage options
const postMessageOpts: TransportOptions = {
  origin: "https://wallet.example.com"
};

// WebSocket options
const wsOpts: TransportOptions = {
  url: "wss://wallet.example.com/ws"
};

// Extension options
const extOpts: TransportOptions = {
  extensionId: "wallet-extension-id"
};
```

## Properties

### url?

> `optional` **url**: `string`

Defined in: [core/modal/src/lib/transports/types.ts:258](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/transports/types.ts#L258)

WebSocket connection URL

***

### origin?

> `optional` **origin**: `string`

Defined in: [core/modal/src/lib/transports/types.ts:260](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/transports/types.ts#L260)

Allowed origin for PostMessage security

***

### extensionId?

> `optional` **extensionId**: `string`

Defined in: [core/modal/src/lib/transports/types.ts:262](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/transports/types.ts#L262)

Browser extension identifier
