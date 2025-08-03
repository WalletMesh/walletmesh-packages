[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ConnectionManagerConfig

# Interface: ConnectionManagerConfig

Defined in: [core/types.ts:1546](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1546)

Configuration for connection lifecycle management.

Defines limits, timeouts, and retry behavior for managing
wallet connections after successful discovery.

## Example

```typescript
const config: ConnectionManagerConfig = {
  maxConnections: 3,
  connectionTimeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
};
```

## Since

0.1.0

## See

Connection management handled by higher-level libraries

## Properties

### connectionTimeout?

> `optional` **connectionTimeout**: `number`

Defined in: [core/types.ts:1548](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1548)

***

### maxConnections?

> `optional` **maxConnections**: `number`

Defined in: [core/types.ts:1547](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1547)

***

### retryAttempts?

> `optional` **retryAttempts**: `number`

Defined in: [core/types.ts:1549](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1549)

***

### retryDelay?

> `optional` **retryDelay**: `number`

Defined in: [core/types.ts:1550](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1550)
