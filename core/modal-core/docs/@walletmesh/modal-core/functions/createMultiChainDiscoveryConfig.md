[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createMultiChainDiscoveryConfig

# Function: createMultiChainDiscoveryConfig()

> **createMultiChainDiscoveryConfig**(`chainTypes`, `options`): [`DiscoveryConfig`](../interfaces/DiscoveryConfig.md)

Create a discovery configuration for multi-chain dApps

## Parameters

### chainTypes

[`ChainType`](../enumerations/ChainType.md)[]

Array of chain types to support

### options

`Partial`\<[`CustomDiscoveryConfig`](../interfaces/CustomDiscoveryConfig.md)\> = `{}`

Configuration options

## Returns

[`DiscoveryConfig`](../interfaces/DiscoveryConfig.md)

Complete discovery configuration

## Example

```typescript
const discoveryConfig = createMultiChainDiscoveryConfig({
  name: 'Cross-Chain DeFi',
  url: 'https://crosschain.com',
  icon: 'https://crosschain.com/icon.png'
}, ['evm', 'solana'], {
  customChains: ['evm:1', 'evm:137', 'solana:mainnet'],
  timeout: 7000
});
```
