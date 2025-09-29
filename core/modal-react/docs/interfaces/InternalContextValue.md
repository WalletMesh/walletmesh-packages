[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / InternalContextValue

# Interface: InternalContextValue

Defined in: [core/modal-react/src/WalletMeshContext.tsx:29](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/WalletMeshContext.tsx#L29)

Internal context value interface providing basic WalletMesh client access
This is the low-level context used internally by the React provider

## Properties

### client

> **client**: `null` \| [`WalletMeshClient`](WalletMeshClient.md)

Defined in: [core/modal-react/src/WalletMeshContext.tsx:31](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/WalletMeshContext.tsx#L31)

The WalletMeshClient instance (null during SSR or initialization)

***

### config

> **config**: [`WalletMeshConfig`](WalletMeshConfig.md)

Defined in: [core/modal-react/src/WalletMeshContext.tsx:33](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/WalletMeshContext.tsx#L33)

Configuration used to create the client

***

### initializationError?

> `optional` **initializationError**: `null` \| `Error`

Defined in: [core/modal-react/src/WalletMeshContext.tsx:37](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/WalletMeshContext.tsx#L37)

Error that occurred during client initialization

***

### isInitializing?

> `optional` **isInitializing**: `boolean`

Defined in: [core/modal-react/src/WalletMeshContext.tsx:35](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/WalletMeshContext.tsx#L35)

Whether the client is currently being initialized
