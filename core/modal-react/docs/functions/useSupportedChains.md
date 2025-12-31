[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useSupportedChains

# Function: useSupportedChains()

> **useSupportedChains**(): [`SwitchChainInfo`](../interfaces/SwitchChainInfo.md)[]

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:747](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useSwitchChain.ts#L747)

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
