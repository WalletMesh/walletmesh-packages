[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshModal

# Function: WalletMeshModal()

> **WalletMeshModal**(): `null` \| `ReactPortal`

Defined in: [core/modal-react/src/components/WalletMeshModal.tsx:110](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshModal.tsx#L110)

WalletMesh Modal Component

React-owned modal that renders UI based on headless state from modal-core.
Uses React Portal to render into document.body and provides a complete
wallet selection and connection interface.

This component is automatically injected by WalletMeshProvider unless
`autoInjectModal` is set to false in the provider configuration.

## Component Architecture

The modal component follows a state-driven rendering approach:
1. **Wallet Selection View**: Default view showing available wallets
2. **Connecting View**: Loading state with spinner during connection
3. **Connected View**: Success state with disconnect option
4. **Error View**: Error state with retry options

## Accessibility Features

- Keyboard navigation (Tab, Enter, Escape)
- ARIA attributes for screen readers
- Focus trap within modal
- Click-outside and Escape key to close

## Styling

Uses CSS modules for scoped styling with customizable CSS variables:
- `--wm-modal-bg`: Background overlay color
- `--wm-modal-content-bg`: Content background
- `--wm-modal-border-radius`: Border radius
- `--wm-modal-max-width`: Maximum modal width

## Returns

`null` \| `ReactPortal`

React component for wallet selection modal

## Examples

```tsx
// Usually auto-injected, but can be used manually:
import { WalletMeshModal } from '@walletmesh/modal-react';

function App() {
  return (
    <WalletMeshProvider config={{ autoInjectModal: false }}>
      <YourApp />
      <WalletMeshModal />
    </WalletMeshProvider>
  );
}
```

```tsx
// With custom styling via CSS variables
function ThemedApp() {
  return (
    <div style={{
      '--wm-modal-bg': 'rgba(0, 0, 0, 0.8)',
      '--wm-modal-content-bg': '#1a1a1a',
      '--wm-modal-border-radius': '16px'
    }}>
      <WalletMeshProvider>
        <App />
      </WalletMeshProvider>
    </div>
  );
}
```
