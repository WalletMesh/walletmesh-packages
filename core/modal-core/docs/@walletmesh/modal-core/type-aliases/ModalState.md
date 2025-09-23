[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ModalState

# Type Alias: ModalState

> **ModalState** = [`HeadlessModalState`](../interfaces/HeadlessModalState.md)

Interface for modal state

## Remarks

Represents the current state of the modal UI.
Includes information about the current view, selected wallet, and any errors.
This is the headless modal state that can be used with any UI framework.

## Example

```typescript
const state: ModalState = modal.getState();
if (state.isOpen && state.view === 'walletSelection') {
  // Show wallet selection UI
}
```
