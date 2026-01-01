[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / BaseModalState

# Interface: BaseModalState

Basic modal UI state interface

## Remarks

Represents the UI state of the modal including visibility,
current view, and loading states. This is extended by more
specific modal state interfaces.

## Example

```typescript
const modalState: BaseModalState = {
  isOpen: true,
  currentView: 'walletSelection',
  isLoading: false
};

// Show loading state
modalState.isLoading = true;
modalState.currentView = 'connecting';
```

## Properties

### currentView

> **currentView**: [`ModalView`](../type-aliases/ModalView.md)

Current view being displayed in the modal

***

### isLoading

> **isLoading**: `boolean`

Whether a loading operation is in progress

***

### isOpen

> **isOpen**: `boolean`

Whether the modal is currently visible
