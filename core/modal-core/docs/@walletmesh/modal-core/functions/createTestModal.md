[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createTestModal

# Function: createTestModal()

> **createTestModal**(): [`ModalController`](../interfaces/ModalController.md)

Create a headless modal controller configured for testing

This factory provides a pre-configured headless modal with mock wallets and
services suitable for unit and integration testing. It automatically
sets up common test scenarios without requiring manual configuration.

## Returns

[`ModalController`](../interfaces/ModalController.md)

Headless modal controller instance with test-friendly defaults:
  - Mock wallets for EVM chains
  - In-memory storage for session persistence
  - Debug logging enabled
  - Headless mode (no UI rendering)
  - Deterministic wallet behaviors for testing

## Example

```ts
// In test files
import { createTestModal } from '@walletmesh/modal-core';

describe('Wallet Connection', () => {
  let modal: ModalController;

  beforeEach(() => {
    modal = createTestModal();
  });

  it('should connect to mock wallet', async () => {
    await modal.open();
    const result = await modal.connect('debug-wallet');
    expect(result.address).toBeDefined();
  });
});
```

## Remarks

The test modal includes:
- 'debug-wallet': Debug wallet that always succeeds for testing
