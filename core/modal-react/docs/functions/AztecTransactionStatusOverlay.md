[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AztecTransactionStatusOverlay

# Function: AztecTransactionStatusOverlay()

> **AztecTransactionStatusOverlay**(`__namedParameters`): `null` \| `ReactPortal`

Defined in: [core/modal-react/src/components/AztecTransactionStatusOverlay.tsx:127](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/AztecTransactionStatusOverlay.tsx#L127)

Full-screen overlay showing Aztec transaction lifecycle progress.

Displays all transaction stages from preparation through confirmation,
with special emphasis on proof generation (which takes 1-2 minutes).
Automatically attaches a navigation guard to prevent accidental tab closure.

## Parameters

### \_\_namedParameters

[`AztecTransactionStatusOverlayProps`](../interfaces/AztecTransactionStatusOverlayProps.md)

## Returns

`null` \| `ReactPortal`
