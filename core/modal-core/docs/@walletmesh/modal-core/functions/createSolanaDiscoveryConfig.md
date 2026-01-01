[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createSolanaDiscoveryConfig

# Function: createSolanaDiscoveryConfig()

> **createSolanaDiscoveryConfig**(`options`): [`DiscoveryConfig`](../interfaces/DiscoveryConfig.md)

Create a discovery configuration for Solana dApps

## Parameters

### options

`Partial`\<[`CustomDiscoveryConfig`](../interfaces/CustomDiscoveryConfig.md)\> = `{}`

Configuration options

## Returns

[`DiscoveryConfig`](../interfaces/DiscoveryConfig.md)

Complete discovery configuration

## Example

```typescript
const discoveryConfig = createSolanaDiscoveryConfig({
  name: 'My Solana App',
  url: 'https://mysolanaapp.com',
  icon: 'https://mysolanaapp.com/icon.png'
});
```
