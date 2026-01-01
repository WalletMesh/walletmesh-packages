[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / AdapterEvent

# Type Alias: AdapterEvent

> **AdapterEvent** = keyof [`AdapterEvents`](AdapterEvents.md)

Core wallet adapter system types for building wallet integrations.
Provides the foundation for creating adapters that connect to different wallet types.

## Example

```typescript
import { WalletAdapter, WalletCapabilities } from '@walletmesh/modal-core';

class MyWalletAdapter implements WalletAdapter {
  // Implementation
}
```
