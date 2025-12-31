[**@walletmesh/aztec-rpc-wallet v0.5.6**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecChainId

# Type Alias: AztecChainId

> **AztecChainId** = `` `aztec:${string}` ``

Defined in: [aztec/rpc-wallet/src/types.ts:76](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L76)

Type-safe Aztec chain ID format following the CAIP-2 standard.

Format: `aztec:{reference}` where reference is typically:
- "mainnet" for the main Aztec network
- A numeric chain ID for test networks (e.g., "31337" for local development)

## Example

```typescript
const mainnetChainId: AztecChainId = "aztec:mainnet";
const localChainId: AztecChainId = "aztec:31337";
```
