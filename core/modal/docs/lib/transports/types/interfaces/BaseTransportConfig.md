[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/transports/types](../README.md) / BaseTransportConfig

# Interface: BaseTransportConfig

Defined in: [core/modal/src/lib/transports/types.ts:9](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/transports/types.ts#L9)

Base configuration interface for transports.

## Properties

### timeout?

> `optional` **timeout**: `number`

Defined in: [core/modal/src/lib/transports/types.ts:11](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/transports/types.ts#L11)

Maximum time to wait for operations (ms)

***

### reconnectAttempts?

> `optional` **reconnectAttempts**: `number`

Defined in: [core/modal/src/lib/transports/types.ts:13](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/transports/types.ts#L13)

Number of reconnection attempts

***

### reconnectDelay?

> `optional` **reconnectDelay**: `number`

Defined in: [core/modal/src/lib/transports/types.ts:15](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/transports/types.ts#L15)

Delay between reconnection attempts (ms)

***

### autoReconnect?

> `optional` **autoReconnect**: `boolean`

Defined in: [core/modal/src/lib/transports/types.ts:17](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/transports/types.ts#L17)

Auto-reconnect on disconnect
