[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createCustomDiscoveryConfig

# Function: createCustomDiscoveryConfig()

> **createCustomDiscoveryConfig**(`capabilities`, `options`): [`DiscoveryConfig`](../interfaces/DiscoveryConfig.md)

Create a discovery configuration with custom capability requirements

## Parameters

### capabilities

Custom capability requirements

#### chains?

`string`[]

#### features?

`string`[]

#### interfaces?

`string`[]

### options

`Partial`\<[`DiscoveryConfig`](../interfaces/DiscoveryConfig.md)\> = `{}`

Configuration options

## Returns

[`DiscoveryConfig`](../interfaces/DiscoveryConfig.md)

Complete discovery configuration

## Example

```typescript
const discoveryConfig = createCustomDiscoveryConfig({
  name: 'Advanced DApp',
  url: 'https://advanced.com'
}, {
  chains: ['evm:1', 'evm:137', 'aztec:mainnet'],
  features: ['account-management', 'private-transactions', 'batch-signing'],
  interfaces: ['eip-1193', 'aztec-wallet']
});
```
