[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createEVMDiscoveryConfig

# Function: createEVMDiscoveryConfig()

> **createEVMDiscoveryConfig**(`options`): [`DiscoveryConfig`](../interfaces/DiscoveryConfig.md)

Create a discovery configuration for EVM-based dApps

## Parameters

### options

`Partial`\<[`CustomDiscoveryConfig`](../interfaces/CustomDiscoveryConfig.md)\> = `{}`

Configuration options

## Returns

[`DiscoveryConfig`](../interfaces/DiscoveryConfig.md)

Complete discovery configuration

## Example

```typescript
const discoveryConfig = createEVMDiscoveryConfig({
  customChains: ['evm:1', 'evm:137', 'evm:42161'],
  timeout: 5000
});
```
