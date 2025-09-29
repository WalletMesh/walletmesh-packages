[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshSandboxedIcon

# Function: WalletMeshSandboxedIcon()

> **WalletMeshSandboxedIcon**(`__namedParameters`): `Element`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:165](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L165)

React component that renders SVG icons in a sandboxed iframe for security

This component ensures that untrusted SVG content from wallets or dApps
cannot execute scripts or access the parent document.

## Rendering Process

1. **Validation**: Icon data URI is validated and normalized
2. **Sandbox Creation**: Iframe is created with strict sandboxing
3. **Content Injection**: SVG is safely injected into the iframe
4. **Error Handling**: Failures trigger recovery strategies
5. **Accessibility**: ARIA attributes are applied for screen readers

## Error Recovery Strategies

When icon loading fails, the component attempts recovery in order:
1. **Fallback Icon**: Use provided fallback if available
2. **Generic Icon**: Show wallet-type generic icon
3. **Text Fallback**: Display wallet initials
4. **Error State**: Show error indicator

## Parameters

### \_\_namedParameters

[`WalletMeshSandboxedIconProps`](../interfaces/WalletMeshSandboxedIconProps.md)

## Returns

`Element`

## Examples

```tsx
// Basic usage
<WalletMeshSandboxedIcon
  src="data:image/svg+xml,<svg>...</svg>"
  size={24}
  onClick={() => selectWallet('metamask')}
  alt="MetaMask icon"
/>

// With fallback and error handling
<WalletMeshSandboxedIcon
  src={wallet.icon}
  fallbackIcon={genericWalletIcon}
  size={32}
  onCspError={(error) => {
    analytics.track('icon_csp_blocked', { wallet: wallet.id });
  }}
  alt={`${wallet.name} icon`}
/>

// Disabled icon for unsupported wallet
<WalletMeshSandboxedIcon
  src="data:image/svg+xml,<svg>...</svg>"
  size={32}
  disabled={!walletSupportsRequiredFeatures}
  disabledStyle="grayscale" // or "opacity" or custom styles
  alt="Unsupported wallet"
  onClick={undefined} // No click handler for disabled state
/>
```

```tsx
// Advanced usage with custom styling
<WalletMeshSandboxedIcon
  src={wallet.icon}
  size={48}
  className="wallet-icon"
  style={{
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}
  disabled={isConnecting}
  onClick={() => !isConnecting && connect(wallet.id)}
  alt={wallet.name}
/>
```
