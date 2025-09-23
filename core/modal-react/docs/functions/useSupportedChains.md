[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useSupportedChains

# Function: useSupportedChains()

> **useSupportedChains**(): [`SwitchChainInfo`](../interfaces/SwitchChainInfo.md)[]

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:745](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L745)

Hook to get supported chains

Returns list of chains supported by the current wallet.

## Returns

[`SwitchChainInfo`](../interfaces/SwitchChainInfo.md)[]

Array of supported chains

## Since

1.0.0

## Example

```tsx
function SupportedChains() {
  const supportedChains = useSupportedChains();

  return (
    <ul>
      {supportedChains.map(chain => (
        <li key={chain.chainId}>
          {chain.name} ({chain.chainType})
        </li>
      ))}
    </ul>
  );
}
```
