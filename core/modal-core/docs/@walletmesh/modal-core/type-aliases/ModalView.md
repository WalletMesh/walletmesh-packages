[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ModalView

# Type Alias: ModalView

> **ModalView** = `"walletSelection"` \| `"connecting"` \| `"connected"` \| `"error"` \| `"switchingChain"` \| `"proving"`

Modal view types representing different UI states

## Remarks

Defines the possible views that can be displayed in the modal.
The modal controller manages transitions between these views based on user actions and connection state.

## Example

```typescript
function renderModalContent(view: ModalView) {
  switch (view) {
    case 'walletSelection':
      return <WalletList />;
    case 'connecting':
      return <ConnectingSpinner />;
    case 'connected':
      return <AccountInfo />;
    case 'error':
      return <ErrorMessage />;
    case 'switchingChain':
      return <ChainSwitchProgress />;
    case 'proving':
      return <ProvingProgress />;
  }
}
```
