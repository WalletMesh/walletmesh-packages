[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useWalletCapabilities

# Function: useWalletCapabilities()

> **useWalletCapabilities**(): [`WalletCapabilitiesInfo`](../interfaces/WalletCapabilitiesInfo.md)

Defined in: [core/modal-react/src/hooks/useWalletCapabilities.ts:154](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useWalletCapabilities.ts#L154)

Hook for discovering wallet capabilities

Returns information about what a wallet supports, including provider types,
blockchain networks, RPC methods, and features. This enables dApps to
adapt their UI and functionality based on wallet capabilities.

## Returns

[`WalletCapabilitiesInfo`](../interfaces/WalletCapabilitiesInfo.md)

Wallet capabilities information

## Since

1.0.0

## Remarks

Capabilities are automatically loaded when a wallet connects and can be
manually refreshed. Use this to:
- Show/hide UI elements based on wallet support
- Choose appropriate provider types
- Validate operations before attempting them
- Display wallet feature information to users

## Examples

```tsx
import { useWalletCapabilities, ProviderType } from '@walletmesh/modal-react';

function WalletInfo() {
  const {
    capabilities,
    supportsProvider,
    supportsMethod,
    supportsChain,
    isLoading,
  } = useWalletCapabilities();

  if (isLoading) {
    return <div>Loading wallet capabilities...</div>;
  }

  if (!capabilities) {
    return <div>Connect wallet to see capabilities</div>;
  }

  return (
    <div>
      <h3>Wallet Capabilities</h3>
      <ul>
        <li>Accounts: {capabilities.accounts.join(', ')}</li>
        <li>Chains: {capabilities.chains.map(c => c.chainId).join(', ')}</li>
        <li>Provider Types: {capabilities.providerTypes.join(', ')}</li>
        <li>Methods: {capabilities.methods.length} supported</li>
      </ul>

      <h4>Feature Support</h4>
      <ul>
        <li>EVM: {supportsProvider(ProviderType.EIP1193) ? '✅' : '❌'}</li>
        <li>Aztec: {supportsProvider(ProviderType.AztecWallet) ? '✅' : '❌'}</li>
        <li>Solana: {supportsProvider(ProviderType.Solana) ? '✅' : '❌'}</li>
      </ul>
    </div>
  );
}
```

```tsx
// Conditional UI based on capabilities
function ConditionalOperations() {
  const { supportsProvider, supportsMethod } = useWalletCapabilities();

  return (
    <div>
      {supportsProvider(ProviderType.EIP1193) && (
        <button>Send ETH Transaction</button>
      )}

      {supportsProvider(ProviderType.AztecWallet) && (
        <button>Private Transaction</button>
      )}

      {supportsMethod('wallet_switchEthereumChain') && (
        <button>Switch Network</button>
      )}

      {supportsMethod('eth_signTypedData_v4') && (
        <button>Sign Typed Data</button>
      )}
    </div>
  );
}
```

```tsx
// Multi-chain support detection
function MultiChainDetection() {
  const { capabilities, supportsChain } = useWalletCapabilities();

  const mainnetSupported = supportsChain('0x1');
  const polygonSupported = supportsChain('0x89');
  const arbitrumSupported = supportsChain('0xa4b1');

  return (
    <div>
      <h3>Network Support</h3>
      <ul>
        <li>Ethereum Mainnet: {mainnetSupported ? '✅' : '❌'}</li>
        <li>Polygon: {polygonSupported ? '✅' : '❌'}</li>
        <li>Arbitrum: {arbitrumSupported ? '✅' : '❌'}</li>
      </ul>
      {capabilities && (
        <p>Total chains supported: {capabilities.chains.length}</p>
      )}
    </div>
  );
}
```
