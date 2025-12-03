[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / SupportedChain

# Type Alias: SupportedChain

> **SupportedChain** = `SupportedChain`

Defined in: core/modal-core/dist/core/types.d.ts:308

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
