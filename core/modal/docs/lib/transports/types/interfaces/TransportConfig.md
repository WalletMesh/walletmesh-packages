[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/transports/types](../README.md) / TransportConfig

# Interface: TransportConfig

Defined in: [core/modal/src/lib/transports/types.ts:190](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/transports/types.ts#L190)

Configuration object for initializing transport instances.

Specifies the transport type and its associated configuration options.
Each transport type may require different options for proper initialization.

## Example

```typescript
const config: TransportConfig = {
  type: TransportType.PostMessage,
  options: {
    origin: "https://wallet.example.com"
  }
};
```

## Properties

### type

> **type**: [`TransportType`](../enumerations/TransportType.md)

Defined in: [core/modal/src/lib/transports/types.ts:191](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/transports/types.ts#L191)

The transport mechanism to use

***

### options?

> `optional` **options**: [`TransportOptions`](TransportOptions.md)

Defined in: [core/modal/src/lib/transports/types.ts:192](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/transports/types.ts#L192)

Optional transport-specific settings
