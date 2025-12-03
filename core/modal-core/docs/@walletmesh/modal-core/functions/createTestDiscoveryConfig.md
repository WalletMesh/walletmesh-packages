[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createTestDiscoveryConfig

# Function: createTestDiscoveryConfig()

> **createTestDiscoveryConfig**(`overrides`): [`DiscoveryConfig`](../interfaces/DiscoveryConfig.md)

Create a minimal discovery configuration for testing

## Parameters

### overrides

`Partial`\<[`DiscoveryConfig`](../interfaces/DiscoveryConfig.md)\> = `{}`

Configuration overrides

## Returns

[`DiscoveryConfig`](../interfaces/DiscoveryConfig.md)

Minimal discovery configuration

## Example

```typescript
const discoveryConfig = createTestDiscoveryConfig({
  timeout: 1000,
  supportedChainTypes: ['evm']
});
```
