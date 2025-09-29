[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ErrorBoundaryProps

# Interface: ErrorBoundaryProps

Defined in: [core/modal-react/src/components/WalletMeshErrorBoundary.tsx:14](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshErrorBoundary.tsx#L14)

Props for the WalletMeshErrorBoundary component

## Properties

### children

> **children**: `ReactNode`

Defined in: [core/modal-react/src/components/WalletMeshErrorBoundary.tsx:16](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshErrorBoundary.tsx#L16)

Child components to render

***

### enableLogging?

> `optional` **enableLogging**: `boolean`

Defined in: [core/modal-react/src/components/WalletMeshErrorBoundary.tsx:24](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshErrorBoundary.tsx#L24)

Whether to log errors to console (default: true)

***

### fallback?

> `optional` **fallback**: `ReactNode` \| (`props`) => `ReactNode`

Defined in: [core/modal-react/src/components/WalletMeshErrorBoundary.tsx:18](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshErrorBoundary.tsx#L18)

Fallback UI to display when an error occurs

***

### logPrefix?

> `optional` **logPrefix**: `string`

Defined in: [core/modal-react/src/components/WalletMeshErrorBoundary.tsx:26](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshErrorBoundary.tsx#L26)

Custom error message prefix for logging

***

### onError()?

> `optional` **onError**: (`error`, `errorInfo`) => `void`

Defined in: [core/modal-react/src/components/WalletMeshErrorBoundary.tsx:22](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshErrorBoundary.tsx#L22)

Callback when an error is caught

#### Parameters

##### error

`unknown`

##### errorInfo

`ErrorInfo`

#### Returns

`void`
