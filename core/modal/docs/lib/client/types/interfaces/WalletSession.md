[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/client/types](../README.md) / WalletSession

# Interface: WalletSession

Defined in: [core/modal/src/lib/client/types.ts:70](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L70)

Represents an active wallet session with its associated state and configurations.

Maintains the connection state, transport layer, protocol adapter, and wallet information
required to manage an active wallet connection.

## Example

```typescript
const session: WalletSession = {
  transport: new PostMessageTransport(),
  adapter: new WalletAdapter(),
  wallet: connectedWallet,
  status: ConnectionStatus.Connected,
  transportConfig: { type: 'postMessage' },
  adapterConfig: { type: 'standard' }
};
```

## Properties

### transport?

> `optional` **transport**: [`Transport`](../../../transports/types/interfaces/Transport.md)

Defined in: [core/modal/src/lib/client/types.ts:71](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L71)

Optional transport instance for communication

***

### adapter?

> `optional` **adapter**: [`Adapter`](../../../adapters/types/interfaces/Adapter.md)

Defined in: [core/modal/src/lib/client/types.ts:72](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L72)

Optional adapter instance for protocol handling

***

### wallet

> **wallet**: [`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)

Defined in: [core/modal/src/lib/client/types.ts:73](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L73)

The connected wallet instance

***

### status

> **status**: [`ConnectionStatus`](../../../../index/enumerations/ConnectionStatus.md)

Defined in: [core/modal/src/lib/client/types.ts:74](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L74)

Current connection status

***

### lastError?

> `optional` **lastError**: `Error`

Defined in: [core/modal/src/lib/client/types.ts:75](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L75)

Last error encountered, if any

***

### transportConfig

> **transportConfig**: [`TransportConfig`](../../../transports/types/interfaces/TransportConfig.md)

Defined in: [core/modal/src/lib/client/types.ts:77](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L77)

Configuration for transport reconnection

***

### adapterConfig

> **adapterConfig**: [`AdapterConfig`](../../../adapters/types/type-aliases/AdapterConfig.md)

Defined in: [core/modal/src/lib/client/types.ts:78](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L78)

Configuration for adapter reconnection
