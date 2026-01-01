[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AztecWalletMeshProvider

# Function: AztecWalletMeshProvider()

> **AztecWalletMeshProvider**(`__namedParameters`): `Element`

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:232](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L232)

Aztec-specialized WalletMesh provider component.

Provides a simplified configuration interface for Aztec dApps by:
- Auto-configuring discovery for Aztec wallets
- Setting sensible defaults for timeouts and retries
- Filtering to show only Aztec-compatible wallets
- Providing Aztec-specific chain configurations

## Parameters

### \_\_namedParameters

[`AztecWalletMeshProviderProps`](../interfaces/AztecWalletMeshProviderProps.md)

## Returns

`Element`

## Examples

```tsx
import { AztecWalletMeshProvider } from '@walletmesh/modal-react';

function App() {
  return (
    <AztecWalletMeshProvider
      config={{
        appName: 'My Aztec DApp',
        appDescription: 'A zero-knowledge application'
      }}
    >
      <MyDApp />
    </AztecWalletMeshProvider>
  );
}
```

```tsx
// With custom chain configuration
<AztecWalletMeshProvider
  config={{
    appName: 'Production Aztec DApp',
    chains: [
      { chainId: 'aztec:mainnet', required: true, label: 'Aztec Mainnet' }
    ],
    debug: false
  }}
>
  <MyDApp />
</AztecWalletMeshProvider>
```
