[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / SupportedChainsConfig

# Type Alias: SupportedChainsConfig

> **SupportedChainsConfig** = `SupportedChainsConfig`

Defined in: core/modal-core/dist/types.d.ts:1281

Type for supported chains configuration

## Remarks

Configuration for multi-chain dApp support with chain requirements.
This interface allows dApps to specify complex multi-chain requirements,
including which blockchain technologies they support and how flexible
they are with chain selection and wallet compatibility.

This type is imported from the schema definition to ensure consistency
across the codebase. The schema provides runtime validation while this
type provides compile-time type safety.

## Examples

```typescript
const chainsConfig: SupportedChainsConfig = {
  chainsByTech: {
    evm: [
      { chainId: 1, required: true, label: 'Ethereum' },
      { chainId: 137, required: false, label: 'Polygon' }
    ],
    solana: [
      { chainId: 'mainnet-beta', required: true, label: 'Solana' }
    ]
  },
  allowMultipleWalletsPerChain: true,
  allowFallbackChains: false
};
```

```typescript
// Cross-chain DeFi app configuration
const defiConfig: SupportedChainsConfig = {
  chainsByTech: {
    evm: [
      { chainId: 1, required: true, label: 'Ethereum', group: 'mainnet' },
      { chainId: 10, required: false, label: 'Optimism', group: 'l2' },
      { chainId: 42161, required: false, label: 'Arbitrum', group: 'l2' }
    ],
    svm: [
      { chainId: 'mainnet-beta', required: false, label: 'Solana', group: 'alt' }
    ]
  },
  allowMultipleWalletsPerChain: false,
  allowFallbackChains: true
};
```
