[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ModalView

# Type Alias: ModalView

> **ModalView** = `"walletSelection"` \| `"connecting"` \| `"connected"` \| `"error"` \| `"switchingChain"` \| `"proving"`

Defined in: core/modal-core/dist/core/types.d.ts:172

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
