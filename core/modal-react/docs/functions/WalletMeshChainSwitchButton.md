[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshChainSwitchButton

# Function: WalletMeshChainSwitchButton()

> **WalletMeshChainSwitchButton**(`props`): `Element`

Defined in: [core/modal-react/src/components/WalletMeshChainSwitchButton.tsx:80](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/components/WalletMeshChainSwitchButton.tsx#L80)

WalletMeshChainSwitchButton Component

Renders a button that allows users to switch to a specific blockchain chain.
Shows visual feedback during the switching process including loading states
and animations.

## Parameters

### props

[`WalletMeshChainSwitchButtonProps`](../interfaces/WalletMeshChainSwitchButtonProps.md)

Component props

## Returns

`Element`

React component for chain switching

## Examples

```tsx
<WalletMeshChainSwitchButton
  targetChain={{ chainId: '0x1', chainType: 'evm', name: 'Ethereum Mainnet', required: false, label: 'Ethereum Mainnet', interfaces: [], group: 'mainnet' }}
  chainName="Ethereum Mainnet"
  chainIcon="/images/ethereum.svg"
  onSuccess={(chain) => console.log('Switched to', chain.name)}
/>
```

```tsx
// With custom styling and error handling
<WalletMeshChainSwitchButton
  targetChain={{ chainId: '0x89', chainType: 'evm', name: 'Polygon', required: false, label: 'Polygon', interfaces: [], group: 'mainnet' }}
  chainName="Polygon"
  chainIcon="/images/polygon.svg"
  className="my-custom-button"
  onError={(error) => toast.error(error.message)}
/>
```
