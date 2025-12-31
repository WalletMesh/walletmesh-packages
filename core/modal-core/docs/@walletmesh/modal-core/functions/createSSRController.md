[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createSSRController

# Function: createSSRController()

> **createSSRController**(): [`WalletMeshClient`](../interfaces/WalletMeshClient.md)

Creates an SSR-safe controller for server environments

This controller provides a safe implementation for server-side rendering
that maintains the same interface as the client-side controller without
requiring browser APIs.

## Returns

[`WalletMeshClient`](../interfaces/WalletMeshClient.md)

SSR-safe controller implementing WalletMeshClient interface

## Example

```typescript
// In a Next.js or other SSR framework
import { createSSRController } from '@walletmesh/modal-core/ssr';

const controller = typeof window === 'undefined'
  ? createSSRController()
  : createModal(config);
```
