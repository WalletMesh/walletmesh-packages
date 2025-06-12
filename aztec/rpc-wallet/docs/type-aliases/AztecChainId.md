[**@walletmesh/aztec-rpc-wallet v0.4.0**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecChainId

# Type Alias: AztecChainId

> **AztecChainId** = `` `aztec:${string}` ``

Defined in: [aztec/rpc-wallet/src/types.ts:64](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/aztec/rpc-wallet/src/types.ts#L64)

Type-safe Aztec chain ID format following the CAIP-2 standard.

Format: `aztec:{reference}` where reference is typically:
- "mainnet" for the main Aztec network
- A numeric chain ID for test networks (e.g., "31337" for local development)

## Example

```typescript
const mainnetChainId: AztecChainId = "aztec:mainnet";
const localChainId: AztecChainId = "aztec:31337";
```
