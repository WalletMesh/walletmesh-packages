[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AztecConnectButton

# Function: AztecConnectButton()

> **AztecConnectButton**(`__namedParameters`): `Element`

Defined in: [core/modal-react/src/components/AztecConnectButton.tsx:79](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/AztecConnectButton.tsx#L79)

Aztec-specific connect button that wraps WalletMeshConnectButton.
Adds proof generation status indicator and Aztec-specific defaults.

## Parameters

### \_\_namedParameters

[`AztecConnectButtonProps`](../interfaces/AztecConnectButtonProps.md)

## Returns

`Element`

## Example

```tsx
import { AztecConnectButton } from '@walletmesh/modal-react';

function DApp() {
  return (
    <AztecConnectButton
      showProvingStatus
      onProvingStart={() => console.log('Generating proof...')}
      onProvingComplete={() => console.log('Proof complete!')}
    />
  );
}
```
