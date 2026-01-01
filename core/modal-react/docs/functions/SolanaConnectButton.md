[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / SolanaConnectButton

# Function: SolanaConnectButton()

> **SolanaConnectButton**(`__namedParameters`): `Element`

Defined in: [core/modal-react/src/components/SolanaConnectButton.tsx:127](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/components/SolanaConnectButton.tsx#L127)

Solana-specific connect button that wraps WalletMeshConnectButton.
Adds transaction status indicator and Solana-specific defaults.

## Parameters

### \_\_namedParameters

[`SolanaConnectButtonProps`](../interfaces/SolanaConnectButtonProps.md)

## Returns

`Element`

## Examples

```tsx
import { SolanaConnectButton } from '@walletmesh/modal-react';

function DApp() {
  return (
    <SolanaConnectButton
      showTransactionStatus
      showClusterIndicator
      onTransactionStart={() => console.log('Transaction started...')}
      onTransactionComplete={() => console.log('Transaction complete!')}
    />
  );
}
```

```tsx
// Custom styling and balance display
<SolanaConnectButton
  label="Connect to Solana"
  showBalance
  showClusterIndicator
  size="lg"
  variant="outline"
/>
```

```tsx
// Integration with transaction handling
function TransactionApp() {
  const [txStatus, setTxStatus] = useState<string>('');

  return (
    <div>
      <SolanaConnectButton
        onTransactionStart={() => setTxStatus('Transaction pending...')}
        onTransactionComplete={() => setTxStatus('Transaction confirmed!')}
        onTransactionError={(error) => setTxStatus(`Error: ${error.message}`)}
      />
      {txStatus && <p>{txStatus}</p>}
    </div>
  );
}
```
