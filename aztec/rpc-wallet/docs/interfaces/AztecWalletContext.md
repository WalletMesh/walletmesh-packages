[**@walletmesh/aztec-rpc-wallet v0.4.0**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecWalletContext

# Interface: AztecWalletContext

Defined in: [aztec/rpc-wallet/src/types.ts:72](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/aztec/rpc-wallet/src/types.ts#L72)

Defines the context object provided to all Aztec wallet-side JSON-RPC method handlers.
This context aggregates essential dependencies required by handlers to perform their operations.

## See

[createAztecWalletNode](../functions/createAztecWalletNode.md) where this context is constructed and provided to handlers.

## Properties

### cache

> **cache**: [`ContractArtifactCache`](../classes/ContractArtifactCache.md)

Defined in: [aztec/rpc-wallet/src/types.ts:88](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/aztec/rpc-wallet/src/types.ts#L88)

An instance of [ContractArtifactCache](../classes/ContractArtifactCache.md) used for caching contract artifacts.
This helps optimize performance by avoiding redundant fetches of artifact data.

***

### pxe

> **pxe**: `PXE`

Defined in: [aztec/rpc-wallet/src/types.ts:83](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/aztec/rpc-wallet/src/types.ts#L83)

The `aztec.js` PXE (Private Execution Environment) client instance.
This is used for interacting with the Aztec network, such as simulating transactions,
getting node information, fetching blocks, and managing private state.

***

### wallet

> **wallet**: `AccountWallet`

Defined in: [aztec/rpc-wallet/src/types.ts:77](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/aztec/rpc-wallet/src/types.ts#L77)

The `aztec.js` AccountWallet instance. This wallet holds the user's account keys
and provides methods for signing, creating transactions, and interacting with the PXE.
