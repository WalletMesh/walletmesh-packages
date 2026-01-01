[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useSupportedChains

# Function: useSupportedChains()

> **useSupportedChains**(): [`SwitchChainInfo`](../interfaces/SwitchChainInfo.md)[]

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:747](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useSwitchChain.ts#L747)

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
