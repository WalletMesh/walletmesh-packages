[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / EVMConnectButton

# Function: EVMConnectButton()

> **EVMConnectButton**(`__namedParameters`): `Element`

Defined in: [core/modal-react/src/components/EVMConnectButton.tsx:127](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/EVMConnectButton.tsx#L127)

EVM-specific connect button that wraps WalletMeshConnectButton.
Adds transaction status indicator and EVM-specific defaults.

## Parameters

### \_\_namedParameters

[`EVMConnectButtonProps`](../interfaces/EVMConnectButtonProps.md)

## Returns

`Element`

## Examples

```tsx
import { EVMConnectButton } from '@walletmesh/modal-react';

function DApp() {
  return (
    <EVMConnectButton
      showTransactionStatus
      showNetworkIndicator
      onTransactionStart={() => console.log('Transaction started...')}
      onTransactionComplete={() => console.log('Transaction complete!')}
    />
  );
}
```

```tsx
// Custom styling and gas estimation
<EVMConnectButton
  label="Connect to Ethereum"
  showGasEstimate
  showNetworkIndicator
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
      <EVMConnectButton
        onTransactionStart={() => setTxStatus('Transaction pending...')}
        onTransactionComplete={() => setTxStatus('Transaction confirmed!')}
        onTransactionError={(error) => setTxStatus(`Error: ${error.message}`)}
      />
      {txStatus && <p>{txStatus}</p>}
    </div>
  );
}
```
