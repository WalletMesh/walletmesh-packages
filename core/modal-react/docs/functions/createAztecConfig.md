[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / createAztecConfig

# Function: createAztecConfig()

> **createAztecConfig**(`config`): [`WalletMeshConfig`](../interfaces/WalletMeshConfig.md)

Defined in: [core/modal-react/src/chains/aztec/config.ts:72](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/chains/aztec/config.ts#L72)

Creates a complete WalletMesh configuration from simplified Aztec config

This helper function transforms a simplified Aztec configuration into a full
WalletMesh configuration with sensible defaults for Aztec dApps. It handles:
- Chain configuration with automatic mainnet/testnet/sandbox mapping
- Default permissions for common Aztec operations
- Optimized discovery settings for Aztec wallets
- Environment-specific defaults (sandbox for dev, testnet for prod)

## Parameters

### config

[`AztecProviderConfig`](../interfaces/AztecProviderConfig.md)

Aztec-specific configuration options

## Returns

[`WalletMeshConfig`](../interfaces/WalletMeshConfig.md)

Complete WalletMesh configuration ready for use

## Examples

```ts
// Basic development configuration
const config = createAztecConfig({
  appName: 'My Aztec DApp',
  appDescription: 'Zero-knowledge trading platform'
});
// Results in sandbox chain with default permissions
```

```ts
// Production configuration with custom chains
const config = createAztecConfig({
  appName: 'Production DApp',
  chains: [
    { chainId: 'aztec:mainnet', required: true, label: 'Aztec Mainnet' }
  ],
  permissions: [
    'aztec_getAddress',
    'aztec_sendTx',
    'aztec_deployContract'
  ]
});
```

```ts
// Multi-environment setup
const config = createAztecConfig({
  appName: 'Cross-Chain DApp',
  chains: [
    { chainId: 'aztec:mainnet', label: 'Mainnet' },
    { chainId: 'aztec:testnet', label: 'Testnet' },
    { chainId: 'aztec:31337', label: 'Local Sandbox' }
  ],
  discoveryTimeout: 8000, // Longer timeout for multiple chains
  debug: true
});
```
