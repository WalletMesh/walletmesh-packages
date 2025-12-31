[**@walletmesh/aztec-rpc-wallet v0.5.6**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecWalletContext

# Interface: AztecWalletContext

Defined in: [aztec/rpc-wallet/src/types.ts:194](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L194)

Defines the context object provided to all Aztec wallet-side JSON-RPC method handlers.
This context aggregates essential dependencies required by handlers to perform their operations.

## See

[createAztecWalletNode](../functions/createAztecWalletNode.md) where this context is constructed and provided to handlers.

## Properties

### cache

> **cache**: [`ContractArtifactCache`](../classes/ContractArtifactCache.md)

Defined in: [aztec/rpc-wallet/src/types.ts:210](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L210)

An instance of [ContractArtifactCache](../classes/ContractArtifactCache.md) used for caching contract artifacts.
This helps optimize performance by avoiding redundant fetches of artifact data.

***

### pxe

> **pxe**: `PXE`

Defined in: [aztec/rpc-wallet/src/types.ts:205](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L205)

The `aztec.js` PXE (Private Execution Environment) client instance.
This is used for interacting with the Aztec network, such as simulating transactions,
getting node information, fetching blocks, and managing private state.

***

### wallet

> **wallet**: [`AccountWallet`](https://docs.aztec.network/reference/aztec.js/interfaces/AccountWallet)

Defined in: [aztec/rpc-wallet/src/types.ts:199](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L199)

The `aztec.js` [AccountWallet](https://docs.aztec.network/reference/aztec.js/interfaces/AccountWallet) instance. This wallet holds the user's account keys
and provides methods for signing, creating transactions, and interacting with the PXE.
