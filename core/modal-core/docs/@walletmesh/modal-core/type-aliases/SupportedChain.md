[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / SupportedChain

# Type Alias: SupportedChain

> **SupportedChain** = [`SupportedChain`](../../../internal/types/typedocExports/type-aliases/SupportedChain.md)

Supported chain configuration type

## Remarks

Configuration for a single blockchain network that a dApp can support.
Contains all necessary metadata for wallet compatibility checking and UI display.

This type is imported from the schema definition to ensure consistency
across the codebase. The schema provides runtime validation while this
type provides compile-time type safety.

## Example

```typescript
const ethereumMainnet: SupportedChain = {
  chainId: 'eip155:1',
  chainType: ChainType.Evm,
  name: 'Ethereum Mainnet',
  required: true,
  interfaces: ['eip1193'],
  group: 'ethereum'
};
```
