[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createWalletMeshClientWithConfig

# Function: createWalletMeshClientWithConfig()

> **createWalletMeshClientWithConfig**(`config`, `options`): [`WalletMeshClient`](../interfaces/WalletMeshClient.md)

Creates a new WalletMeshClient instance with full configuration control

This factory function handles the creation and configuration of:
- WalletRegistry with built-in adapters
- Modal controller with framework adapter
- Logger and error handling
- ProviderLoader for lazy loading
- Event system integration

## Parameters

### config

[`WalletMeshConfig`](../interfaces/WalletMeshConfig.md)

Full configuration for the WalletMeshClient

### options

[`CreateWalletMeshClientOptions`](../interfaces/CreateWalletMeshClientOptions.md) = `{}`

Optional creation options

## Returns

[`WalletMeshClient`](../interfaces/WalletMeshClient.md)

A fully configured WalletMeshClient instance

## Throws

If configuration is invalid or creation fails

## Examples

```typescript
// Full configuration
const client = createWalletMeshClientWithConfig({
  appName: 'My DApp',
  appDescription: 'A decentralized application',
  chains: [
    { chainId: '1', chainType: 'evm', name: 'Ethereum' }
  ],
  providerLoader: {
    preloadOnInit: true,
    preloadChainTypes: ['evm', 'solana']
  },
  discovery: {
    enabled: true,
    timeout: 5000
  }
}, {
  registerBuiltinAdapters: true
});
```

```typescript
// SSR-safe usage
const client = createWalletMeshClientWithConfig({
  appName: 'My DApp'
}, {
  ssr: true // Will return SSR-safe controller in server environment
});
```
