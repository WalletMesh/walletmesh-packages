[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useConfig

# Function: useConfig()

> **useConfig**(): [`UseConfigReturn`](../interfaces/UseConfigReturn.md)

Defined in: [core/modal-react/src/hooks/useConfig.ts:145](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useConfig.ts#L145)

Hook for accessing WalletMesh configuration and modal controls

Provides configuration access and modal control interface
following wagmi's useConfig pattern.

## Returns

[`UseConfigReturn`](../interfaces/UseConfigReturn.md)

Configuration and control methods

## Since

1.0.0

## See

 - [useAccount](useAccount.md) - For account and connection state
 - [useConnect](useConnect.md) - For connection operations

## Remarks

This is the primary hook for accessing WalletMesh configuration
and controlling the modal. It combines:
- Client instance access
- Modal open/close controls
- App configuration
- Wallet discovery state
- Debug mode status

The modal will automatically handle wallet selection and connection
when opened.

## Examples

```tsx
function ConnectButton() {
  const { open, isOpen, wallets } = useConfig();

  return (
    <div>
      <button onClick={open} disabled={isOpen}>
        Connect Wallet
      </button>
      <p>Available wallets: {wallets.length}</p>
    </div>
  );
}
```

```tsx
// Access configuration
function AppInfo() {
  const { appName, chains, debug } = useConfig();

  return (
    <div>
      <h1>{appName}</h1>
      <p>Supported chains: {chains.join(', ')}</p>
      {debug && <p>Debug mode enabled</p>}
    </div>
  );
}
```

```tsx
// Wallet discovery state
function WalletDiscovery() {
  const { wallets, isDiscovering } = useConfig();

  return (
    <div>
      <h3>Available Wallets ({wallets.length})</h3>
      {isDiscovering && <p>Discovering...</p>}

      {wallets.map(wallet => (
        <div key={wallet.id}>
          <img src={wallet.icon} alt={wallet.name} />
          <span>{wallet.name}</span>
        </div>
      ))}
    </div>
  );
}
```
