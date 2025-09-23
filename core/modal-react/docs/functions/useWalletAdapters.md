[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useWalletAdapters

# Function: useWalletAdapters()

> **useWalletAdapters**(): [`WalletInfo`](../interfaces/WalletInfo.md)[]

Defined in: [core/modal-react/src/hooks/useConnect.ts:718](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L718)

Hook to get available wallet adapters

Returns the list of available wallets that can be connected to.
This is a subset of useConnect focused only on wallet discovery.

## Returns

[`WalletInfo`](../interfaces/WalletInfo.md)[]

Array of available wallets

## Since

1.0.0

## Example

```tsx
function WalletGrid() {
  const wallets = useWalletAdapters();

  return (
    <div className="wallet-grid">
      {wallets.map(wallet => (
        <WalletCard key={wallet.id} wallet={wallet} />
      ))}
    </div>
  );
}
```
