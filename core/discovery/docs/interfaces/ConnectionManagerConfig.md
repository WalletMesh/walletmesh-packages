[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ConnectionManagerConfig

# Interface: ConnectionManagerConfig

Defined in: [core/types.ts:1546](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1546)

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

Defined in: [core/types.ts:1548](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1548)

***

### maxConnections?

> `optional` **maxConnections**: `number`

Defined in: [core/types.ts:1547](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1547)

***

### retryAttempts?

> `optional` **retryAttempts**: `number`

Defined in: [core/types.ts:1549](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1549)

***

### retryDelay?

> `optional` **retryDelay**: `number`

Defined in: [core/types.ts:1550](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1550)
