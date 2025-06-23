[**@walletmesh/aztec-rpc-wallet v0.4.1**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / createAztecWallet

# Function: createAztecWallet()

> **createAztecWallet**(`provider`, `chainId`): `Promise`\<[`AztecDappWallet`](../classes/AztecDappWallet.md)\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:872](https://github.com/WalletMesh/walletmesh-packages/blob/c22c9775e630bf48780e547c01c8f5442dc5b36c/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L872)

Helper function to create and initialize an AztecDappWallet instance.
This is the recommended way to instantiate an Aztec wallet for dApp use,
as it ensures all necessary asynchronous setup (like fetching initial
address and chain ID) is completed.

## Parameters

### provider

[`AztecRouterProvider`](../classes/AztecRouterProvider.md)

An [AztecRouterProvider](../classes/AztecRouterProvider.md) instance, which handles Aztec-specific type serialization.

### chainId

`` `aztec:${string}` `` = `'aztec:mainnet'`

The Aztec chain ID (e.g., 'aztec:mainnet', 'aztec:31337') for the wallet. Defaults to 'aztec:mainnet'.

## Returns

`Promise`\<[`AztecDappWallet`](../classes/AztecDappWallet.md)\>

A promise that resolves to a fully initialized [AztecDappWallet](../classes/AztecDappWallet.md) instance.

## Example

```typescript
const dAppTransport = { send: ..., onMessage: ... }; // User-defined transport
const provider = new AztecRouterProvider(dAppTransport);
await provider.connect({ 'aztec:mainnet': ['aztec_getAddress'] }); // Connect first
const wallet = await createAztecWallet(provider, 'aztec:mainnet');
const address = wallet.getAddress(); // Now usable
```
