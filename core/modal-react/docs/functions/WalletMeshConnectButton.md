[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshConnectButton

# Function: WalletMeshConnectButton()

> **WalletMeshConnectButton**(`props`): `Element`

Defined in: [core/modal-react/src/components/WalletMeshConnectButton.tsx:199](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/WalletMeshConnectButton.tsx#L199)

Pre-built connect button component with sensible defaults

Provides a ready-to-use wallet connection button that handles
both connection and disconnection states automatically.

## Features
- **Automatic State Management**: Shows appropriate UI based on connection state
- **Built-in Loading States**: Displays spinner during connection
- **Address Display**: Optionally shows shortened wallet address
- **Chain Display**: Optionally shows current chain ID
- **Disconnect Confirmation**: Optional confirmation dialog before disconnecting
- **Custom Behavior**: Override default disconnect with custom click handler
- **Responsive Design**: Three size variants with proper scaling
- **Accessibility**: Proper ARIA attributes and keyboard support

## Styling
The button comes with three variants:
- `primary`: Blue background, white text (default)
- `secondary`: Gray background, white text
- `outline`: Transparent background with border

## Connection States
- **Disconnected**: Shows connect label, opens modal on click
- **Connecting**: Shows loading spinner with "Connecting..." text
- **Connected**: Shows green dot indicator with configurable content

## Parameters

### props

[`WalletMeshConnectButtonProps`](../interfaces/WalletMeshConnectButtonProps.md)

Component props

## Returns

`Element`

React element representing the connect button

## Examples

```tsx
// Simple usage with defaults
<WalletMeshConnectButton />
```

```tsx
// Custom styling and labels
<WalletMeshConnectButton
  size="lg"
  variant="outline"
  label="Connect Your Wallet"
  className="custom-button"
  style={{ borderRadius: '12px' }}
/>
```

```tsx
// Show wallet information when connected
<WalletMeshConnectButton
  showAddress={true}
  showChain={true}
  size="md"
/>
// Connected state shows: "🟢 0x1234...5678 • Chain: 1"
```

```tsx
// Custom connected behavior (e.g., show account modal instead of disconnect)
function App() {
  const [showAccountModal, setShowAccountModal] = useState(false);

  return (
    <>
      <WalletMeshConnectButton
        onConnectedClick={() => setShowAccountModal(true)}
        showAddress={true}
      />
      {showAccountModal && <AccountModal />}
    </>
  );
}
```

```tsx
// Custom connected click behavior
<WalletMeshConnectButton
  onConnectedClick={() => console.log('Connected wallet clicked')}
  showAddress={true}
/>
// When user clicks connected button: calls custom handler instead of opening modal
```

```tsx
// Disabled state for maintenance or loading
<WalletMeshConnectButton
  disabled={isMaintenanceMode}
  label={isMaintenanceMode ? "Maintenance" : "Connect Wallet"}
/>
```

## Since

1.0.0
