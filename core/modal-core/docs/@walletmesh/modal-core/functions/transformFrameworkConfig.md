[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / transformFrameworkConfig

# Function: transformFrameworkConfig()

> **transformFrameworkConfig**(`config`): [`CoreWalletMeshConfig`](../interfaces/CoreWalletMeshConfig.md)

Transform framework-specific configuration to core WalletMesh configuration

Converts framework-specific configuration formats (e.g., from React, Vue, Svelte)
into the standardized core configuration format. Handles chain type inference,
wallet configuration normalization, and property mapping.

## Parameters

### config

[`FrameworkConfig`](../interfaces/FrameworkConfig.md)

Framework-specific configuration

## Returns

[`CoreWalletMeshConfig`](../interfaces/CoreWalletMeshConfig.md)

Transformed core configuration

## Examples

```typescript
// Transform React/Vue/Svelte config to core format
const frameworkConfig = {
  appName: 'My DApp',
  chains: [
    { chainId: '1', name: 'Ethereum' },
    { chainId: 'solana:mainnet', name: 'Solana' }
  ],
  wallets: ['metamask', 'phantom']
};

const coreConfig = transformFrameworkConfig(frameworkConfig);
// Result: { appName: 'My DApp', chains: [...], wallets: { include: ['metamask', 'phantom'] } }
```

```typescript
// Transform config with complex wallet objects
const frameworkConfig = {
  appName: 'My DApp',
  chains: [{ chainId: 'eip155:1', chainType: 'evm', name: 'Ethereum' }],
  wallets: [
    { id: 'metamask', name: 'MetaMask', chains: ['evm'] },
    'phantom'
  ]
};

const coreConfig = transformFrameworkConfig(frameworkConfig);
```

## Since

3.0.0
