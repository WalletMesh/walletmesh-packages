[**@walletmesh/modal v0.0.5**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/transports/types](../README.md) / TransportConfig

# Interface: TransportConfig

Defined in: [core/modal/src/lib/transports/types.ts:190](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/transports/types.ts#L190)

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

Defined in: [core/modal/src/lib/transports/types.ts:191](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/transports/types.ts#L191)

The transport mechanism to use

***

### options?

> `optional` **options**: [`TransportOptions`](TransportOptions.md)

Defined in: [core/modal/src/lib/transports/types.ts:192](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/transports/types.ts#L192)

Optional transport-specific settings
