[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AztecTransactionStatusOverlay

# Function: AztecTransactionStatusOverlay()

> **AztecTransactionStatusOverlay**(`__namedParameters`): `null` \| `ReactPortal`

Defined in: [core/modal-react/src/components/AztecTransactionStatusOverlay.tsx:127](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/components/AztecTransactionStatusOverlay.tsx#L127)

Full-screen overlay showing Aztec transaction lifecycle progress.

Displays all transaction stages from preparation through confirmation,
with special emphasis on proof generation (which takes 1-2 minutes).
Automatically attaches a navigation guard to prevent accidental tab closure.

## Parameters

### \_\_namedParameters

[`AztecTransactionStatusOverlayProps`](../interfaces/AztecTransactionStatusOverlayProps.md)

## Returns

`null` \| `ReactPortal`
