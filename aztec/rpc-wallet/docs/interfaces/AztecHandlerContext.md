[**@walletmesh/aztec-rpc-wallet v0.5.4**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecHandlerContext

# Interface: AztecHandlerContext

Defined in: [aztec/rpc-wallet/src/wallet/handlers/index.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/wallet/handlers/index.ts#L26)

Defines the context object that is passed to all Aztec wallet JSON-RPC method handlers.
This context provides handlers with the necessary dependencies to perform their operations.
It extends the base JSONRPCContext with Aztec-specific instances.

## Extends

- `JSONRPCContext`

## Indexable

\[`key`: `string`\]: `unknown`

## Properties

### cache

> **cache**: [`ContractArtifactCache`](../classes/ContractArtifactCache.md)

Defined in: [aztec/rpc-wallet/src/wallet/handlers/index.ts:29](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/wallet/handlers/index.ts#L29)

An instance of [ContractArtifactCache](../classes/ContractArtifactCache.md) used for caching
                  contract artifacts to optimize performance.

***

### pxe

> **pxe**: `PXE`

Defined in: [aztec/rpc-wallet/src/wallet/handlers/index.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/wallet/handlers/index.ts#L28)

An instance of PXE (Private Execution Environment) client
                from `aztec.js`, used for interacting with the Aztec network.

***

### wallet

> **wallet**: `AccountWallet`

Defined in: [aztec/rpc-wallet/src/wallet/handlers/index.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/wallet/handlers/index.ts#L27)

An instance of AccountWallet from `aztec.js`,
                   representing the user's account and signing capabilities.
