[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ModalState

# Type Alias: ModalState

> **ModalState** = `HeadlessModalState`

Defined in: core/modal-core/dist/types.d.ts:288

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
