[**@walletmesh/aztec-rpc-wallet v0.5.0**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecChainId

# Type Alias: AztecChainId

> **AztecChainId** = `` `aztec:${string}` ``

Defined in: [aztec/rpc-wallet/src/types.ts:62](https://github.com/WalletMesh/walletmesh-packages/blob/fd734440d9c5e6ff3c77f868722c74b1be65d39d/aztec/rpc-wallet/src/types.ts#L62)

Type-safe Aztec chain ID format following the CAIP-2 standard.

Format: `aztec:{reference}` where reference is typically:
- "mainnet" for the main Aztec network
- A numeric chain ID for test networks (e.g., "31337" for local development)

## Example

```typescript
const mainnetChainId: AztecChainId = "aztec:mainnet";
const localChainId: AztecChainId = "aztec:31337";
```
