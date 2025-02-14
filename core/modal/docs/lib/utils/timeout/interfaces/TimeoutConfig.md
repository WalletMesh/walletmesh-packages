[**@walletmesh/modal v0.0.5**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/utils/timeout](../README.md) / TimeoutConfig

# Interface: TimeoutConfig

Defined in: [core/modal/src/lib/utils/timeout.ts:17](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/utils/timeout.ts#L17)

Configuration options for wallet operation timeouts.

Provides customizable timeout durations for different types
of wallet operations to ensure they don't hang indefinitely.

## Example

```typescript
const config: TimeoutConfig = {
  connectionTimeout: 45000,  // 45 seconds for initial connection
  operationTimeout: 15000    // 15 seconds for other operations
};

const wallet = await connect(walletInfo, config);
```

## Properties

### connectionTimeout?

> `optional` **connectionTimeout**: `number`

Defined in: [core/modal/src/lib/utils/timeout.ts:22](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/utils/timeout.ts#L22)

Timeout in milliseconds for initial wallet connection

#### Default

```ts
30000 (30 seconds)
```

***

### operationTimeout?

> `optional` **operationTimeout**: `number`

Defined in: [core/modal/src/lib/utils/timeout.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/utils/timeout.ts#L28)

Timeout in milliseconds for other wallet operations

#### Default

```ts
10000 (10 seconds)
```
