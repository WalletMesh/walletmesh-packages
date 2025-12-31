[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useAccount

# Function: useAccount()

> **useAccount**(`options`): [`AccountInfo`](../interfaces/AccountInfo.md)

Defined in: [core/modal-react/src/hooks/useAccount.ts:320](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAccount.ts#L320)

Consolidated hook for accessing account state and wallet selection

Provides comprehensive account information including addresses,
connection status, chain details, wallet metadata, and wallet
selection capabilities.

## Parameters

### options

[`WalletSelectionOptions`](../interfaces/WalletSelectionOptions.md) = `{}`

Wallet selection options

## Returns

[`AccountInfo`](../interfaces/AccountInfo.md)

Account information and wallet selection utilities

## Since

2.0.0

## See

 - [useConnect](useConnect.md) - For connecting wallets
 - [useSwitchChain](useSwitchChain.md) - For changing chains
 - [useBalance](useBalance.md) - For fetching account balances
 - [useTransaction](useTransaction.md) - For sending transactions

## Remarks

This hook consolidates account state and wallet selection functionality.
It combines multiple pieces of state into a single interface, making it
the primary hook for accessing account-related information and managing
wallet selection. The hook uses shallow equality checks for performance.

## Examples

```tsx
function Account() {
  const {
    address,
    isConnected,
    chainId,
    wallet,
    availableWallets,
    selectWallet,
    preferredWallet
  } = useAccount();

  if (!isConnected) {
    return (
      <div>
        <h3>Select a wallet:</h3>
        {availableWallets.map(w => (
          <button key={w.id} onClick={() => selectWallet(w)}>
            {w.name}
          </button>
        ))}
        {preferredWallet && (
          <p>Preferred: {preferredWallet.name}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <p>Address: {address}</p>
      <p>Chain ID: {chainId}</p>
      <p>Wallet: {wallet?.name}</p>
    </div>
  );
}
```

```tsx
// Wallet selection with persistence
function WalletSelector() {
  const {
    availableWallets,
    preferredWallet,
    setPreferredWallet,
    isWalletAvailable,
    getInstallUrl
  } = useAccount({
    persistPreference: true,
    filterByChainType: [ChainType.Evm]
  });

  return (
    <div>
      {availableWallets.map(wallet => {
        const isAvailable = isWalletAvailable(wallet.id);
        const installUrl = getInstallUrl(wallet.id);
        const isPreferred = preferredWallet?.id === wallet.id;

        return (
          <div key={wallet.id}>
            <h4>{wallet.name}</h4>
            {isAvailable ? (
              <button onClick={() => setPreferredWallet(wallet)}>
                {isPreferred ? '★ Preferred' : 'Set as Preferred'}
              </button>
            ) : (
              <a href={installUrl || '#'} target="_blank">
                Install
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
```
