[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / EventData

# Type Alias: EventData\<E\>

> **EventData**\<`E`\> = [`AdapterEvents`](AdapterEvents.md)\[`E`\]

Core wallet adapter system types for building wallet integrations.
Provides the foundation for creating adapters that connect to different wallet types.

## Type Parameters

### E

`E` *extends* [`AdapterEvent`](AdapterEvent.md)

## Example

```typescript
import { WalletAdapter, WalletCapabilities } from '@walletmesh/modal-core';

class MyWalletAdapter implements WalletAdapter {
  // Implementation
}
```
