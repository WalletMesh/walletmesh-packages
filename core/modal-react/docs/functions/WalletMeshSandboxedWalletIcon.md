[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshSandboxedWalletIcon

# Function: WalletMeshSandboxedWalletIcon()

> **WalletMeshSandboxedWalletIcon**(`__namedParameters`): `Element`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:546](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L546)

Convenience component for rendering wallet icons with consistent props

This component simplifies wallet icon rendering by accepting a wallet object
and automatically handling the wallet ID in click handlers.

## Use Cases

- **Wallet Lists**: Render icons in wallet selection grids
- **Connection Status**: Show connected wallet icon
- **Multi-wallet**: Display multiple connected wallets
- **Feature Detection**: Disable unsupported wallets visually

## Parameters

### \_\_namedParameters

[`WalletMeshSandboxedWalletIconProps`](../interfaces/WalletMeshSandboxedWalletIconProps.md)

## Returns

`Element`

## Examples

```tsx
// Basic usage in wallet list
{wallets.map(wallet => (
  <WalletMeshSandboxedWalletIcon
    key={wallet.id}
    wallet={wallet}
    size={32}
    onClick={(walletId) => selectWallet(walletId)}
  />
))}
```

```tsx
// With feature detection
<WalletMeshSandboxedWalletIcon
  wallet={wallet}
  size={40}
  disabled={!wallet.supportsChain(currentChain)}
  disabledStyle="opacity"
  onClick={(walletId) => {
    if (wallet.supportsChain(currentChain)) {
      connect(walletId);
    } else {
      showChainSupportError(walletId);
    }
  }}
/>
```

```tsx
// Connected wallet indicator
function ConnectedWalletBadge({ wallet }: { wallet: WalletInfo }) {
  return (
    <div className="connected-badge">
      <WalletMeshSandboxedWalletIcon
        wallet={wallet}
        size={24}
        className="connected-icon"
      />
      <span>{wallet.name}</span>
      <span className="status-dot" />
    </div>
  );
}
```
