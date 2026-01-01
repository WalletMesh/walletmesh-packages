[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createUniversalController

# Function: createUniversalController()

> **createUniversalController**(`createBrowserController`): [`ModalController`](../interfaces/ModalController.md)

Create a controller that works in both SSR and browser environments

## Parameters

### createBrowserController

() => [`ModalController`](../interfaces/ModalController.md)

Function to create browser controller

## Returns

[`ModalController`](../interfaces/ModalController.md)

Controller instance appropriate for the environment

## Example

```typescript
const controller = createUniversalController(() =>
  createModal({ wallets, theme: 'light' })
);
```
