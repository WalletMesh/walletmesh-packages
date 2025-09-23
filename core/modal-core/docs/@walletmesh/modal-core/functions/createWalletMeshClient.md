[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createWalletMeshClient

# Function: createWalletMeshClient()

> **createWalletMeshClient**(`appName`, `additionalConfig`): [`WalletMeshClient`](../classes/WalletMeshClient.md)

Creates a WalletMeshClient instance with sensible defaults

This is a convenience function that provides commonly used configurations
for typical dApp scenarios.

## Parameters

### appName

`string`

Name of the application

### additionalConfig

`Partial`\<[`WalletMeshClientConfig`](../interfaces/WalletMeshClientConfig.md)\> = `{}`

Additional configuration options

## Returns

[`WalletMeshClient`](../classes/WalletMeshClient.md)

Configured WalletMeshClient instance

## Example

```typescript
// Quick setup for development
const client = createWalletMeshClient('My DApp', {
  chains: [
    { chainId: '1', chainType: 'evm', name: 'Ethereum' },
    { chainId: '137', chainType: 'evm', name: 'Polygon' }
  ]
});
```
