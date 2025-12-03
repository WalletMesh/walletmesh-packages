# Chain Configurations

This directory contains pre-configured chain definitions for popular blockchain networks supported by WalletMesh.

## Overview

The chain configurations provide standardized definitions for blockchain networks that can be used with WalletMesh's multi-chain wallet connection system. Each chain configuration includes:

- **chainId**: Unique identifier for the blockchain
- **required**: Whether the chain is required for the dApp
- **label**: Human-readable name for the chain
- **interfaces**: Supported provider interfaces
- **group**: Grouping identifier for related chains

## Available Chains

### EVM Chains (`ethereum.ts`)
- **Mainnet**: Ethereum, Polygon, Arbitrum One, Optimism, Base
- **Testnet**: Sepolia, Holesky, Polygon Amoy, Arbitrum Sepolia, Optimism Sepolia, Base Sepolia

### Solana Chains (`solana.ts`)
- **Mainnet**: Solana Mainnet Beta
- **Testnet**: Devnet, Testnet

### Aztec Chains (`aztec.ts`)
- **Mainnet**: Aztec Mainnet
- **Testnet**: Aztec Testnet, Aztec Sandbox

## Usage

### Basic Usage

```typescript
import { ethereumMainnet, solanaMainnet } from '@walletmesh/modal/chains';
import { ChainType } from '@walletmesh/modal';

const config: SupportedChainsConfig = {
  chainsByTech: {
    [ChainType.Evm]: [ethereumMainnet],
    [ChainType.Solana]: [solanaMainnet]
  }
};
```

### Using Helper Functions

```typescript
import { createMainnetConfig, createTestnetConfig, createCustomConfig } from '@walletmesh/modal/chains';

// All mainnet chains
const mainnetConfig = createMainnetConfig();

// Only testnets
const testnetConfig = createTestnetConfig();

// Custom selection
const customConfig = createCustomConfig({
  evm: [ethereumMainnet, polygonMainnet],
  solana: [solanaMainnet]
});
```

### Marking Chains as Required

```typescript
import { createMainnetConfig, markChainsRequired } from '@walletmesh/modal/chains';

const config = createMainnetConfig();

// Mark Ethereum (chainId: 1) as required
const requiredConfig = markChainsRequired(config, [1]);
```

## Helper Functions

### `createMainnetConfig(options?)`
Creates a configuration with all mainnet chains.

Options:
- `includeEvm`: Include EVM chains (default: true)
- `includeSolana`: Include Solana chains (default: true)
- `includeAztec`: Include Aztec chains (default: true)
- `allowMultipleWalletsPerChain`: Allow multiple wallets per chain (default: false)
- `allowFallbackChains`: Allow fallback chains (default: false)

### `createTestnetConfig(options?)`
Creates a configuration with all testnet chains. Same options as `createMainnetConfig`.

### `createAllChainsConfig(options?)`
Creates a configuration with all available chains (mainnet and testnet).

### `createCustomConfig(chains, options?)`
Creates a custom configuration with specific chains.

### `markChainsRequired(config, requiredChainIds)`
Marks specific chains as required in a configuration.

### `filterChainsByGroup(chains, group)`
Filters chains by their group identifier.

### `isChainSupported(config, chainId)`
Checks if a chain ID is supported in a configuration.

### `getRequiredChains(config)`
Gets all chains marked as required from a configuration.

## Chain Groups

Chains are organized into groups for easier filtering:

- **EVM Groups**: `ethereum`, `polygon`, `arbitrum`, `optimism`, `base`
- **Solana Groups**: `solana`
- **Aztec Groups**: `aztec`

## Examples

### Environment-Based Configuration

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

const chainConfig = isDevelopment
  ? createTestnetConfig()
  : createMainnetConfig();
```

### Chain-Specific Wallet Filtering

```typescript
// Only EVM chains
const evmConfig = createCustomConfig({
  [ChainType.Evm]: evmChains
});

// Only Polygon chains
const polygonChains = filterChainsByGroup(evmChains, 'polygon');
const polygonConfig = createCustomConfig({
  [ChainType.Evm]: polygonChains
});
```

### Multi-Chain with Required Chains

```typescript
// Create config with multiple chains
const config = createCustomConfig({
  [ChainType.Evm]: [ethereumMainnet, polygonMainnet, arbitrumOne],
  [ChainType.Solana]: [solanaMainnet]
});

// Mark Ethereum and Solana as required
const finalConfig = markChainsRequired(config, [1, 'mainnet-beta']);
```

## Adding New Chains

To add support for a new chain:

1. Add the chain definition to the appropriate file (`ethereum.ts`, `solana.ts`, or `aztec.ts`)
2. Include it in the relevant arrays (mainnet/testnet)
3. Export it from the file
4. Update this README with the new chain information

Example:
```typescript
export const newChain: SupportedChain = {
  chainId: 12345,
  required: false,
  label: 'New Chain',
  interfaces: ['eip1193'],
  group: 'new-chain'
};
```