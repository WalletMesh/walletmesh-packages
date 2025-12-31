[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useWalletAdapters

# Function: useWalletAdapters()

> **useWalletAdapters**(): [`WalletInfo`](../interfaces/WalletInfo.md)[]

Defined in: [core/modal-react/src/hooks/useConnect.ts:742](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useConnect.ts#L742)

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
