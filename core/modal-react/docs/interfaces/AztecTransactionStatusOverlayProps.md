[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AztecTransactionStatusOverlayProps

# Interface: AztecTransactionStatusOverlayProps

Defined in: [core/modal-react/src/components/AztecTransactionStatusOverlay.tsx:14](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/AztecTransactionStatusOverlay.tsx#L14)

## Properties

### allowEscapeKeyClose?

> `optional` **allowEscapeKeyClose**: `boolean`

Defined in: [core/modal-react/src/components/AztecTransactionStatusOverlay.tsx:37](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/AztecTransactionStatusOverlay.tsx#L37)

Allow ESC key to close overlay when in terminal state (confirmed/failed).
Defaults to true.

***

### container?

> `optional` **container**: `null` \| `Element`

Defined in: [core/modal-react/src/components/AztecTransactionStatusOverlay.tsx:27](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/AztecTransactionStatusOverlay.tsx#L27)

Optional custom container element to render into. Defaults to `document.body`.

***

### description?

> `optional` **description**: `string`

Defined in: [core/modal-react/src/components/AztecTransactionStatusOverlay.tsx:18](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/AztecTransactionStatusOverlay.tsx#L18)

Override the supporting description text.

***

### disableFocusTrap?

> `optional` **disableFocusTrap**: `boolean`

Defined in: [core/modal-react/src/components/AztecTransactionStatusOverlay.tsx:42](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/AztecTransactionStatusOverlay.tsx#L42)

Disable focus trapping (for custom focus management).
Defaults to false (focus trapping enabled).

***

### disableNavigationGuard?

> `optional` **disableNavigationGuard**: `boolean`

Defined in: [core/modal-react/src/components/AztecTransactionStatusOverlay.tsx:23](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/AztecTransactionStatusOverlay.tsx#L23)

Disable the beforeunload navigation guard that warns users before closing the tab.
Enabled by default while the overlay is visible.

***

### headline?

> `optional` **headline**: `string`

Defined in: [core/modal-react/src/components/AztecTransactionStatusOverlay.tsx:16](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/AztecTransactionStatusOverlay.tsx#L16)

Override the headline text.

***

### showBackgroundTransactions?

> `optional` **showBackgroundTransactions**: `boolean`

Defined in: [core/modal-react/src/components/AztecTransactionStatusOverlay.tsx:32](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/AztecTransactionStatusOverlay.tsx#L32)

Show progress for async (background) transactions in addition to sync transactions.
Defaults to false (only shows sync/active transactions).
