[**@walletmesh/aztec-rpc-wallet v0.5.4**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecWalletContext

# Interface: AztecWalletContext

Defined in: [aztec/rpc-wallet/src/types.ts:70](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/types.ts#L70)

Defines the context object provided to all Aztec wallet-side JSON-RPC method handlers.
This context aggregates essential dependencies required by handlers to perform their operations.

## See

[createAztecWalletNode](../functions/createAztecWalletNode.md) where this context is constructed and provided to handlers.

## Properties

### cache

> **cache**: [`ContractArtifactCache`](../classes/ContractArtifactCache.md)

Defined in: [aztec/rpc-wallet/src/types.ts:86](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/types.ts#L86)

An instance of [ContractArtifactCache](../classes/ContractArtifactCache.md) used for caching contract artifacts.
This helps optimize performance by avoiding redundant fetches of artifact data.

***

### pxe

> **pxe**: `PXE`

Defined in: [aztec/rpc-wallet/src/types.ts:81](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/types.ts#L81)

The `aztec.js` PXE (Private Execution Environment) client instance.
This is used for interacting with the Aztec network, such as simulating transactions,
getting node information, fetching blocks, and managing private state.

***

### wallet

> **wallet**: `AccountWallet`

Defined in: [aztec/rpc-wallet/src/types.ts:75](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/types.ts#L75)

The `aztec.js` AccountWallet instance. This wallet holds the user's account keys
and provides methods for signing, creating transactions, and interacting with the PXE.
