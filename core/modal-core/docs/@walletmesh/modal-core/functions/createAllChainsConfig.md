[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createAllChainsConfig

# Function: createAllChainsConfig()

> **createAllChainsConfig**(`options?`): `object`

Create a multi-chain configuration with all available chains

## Parameters

### options?

#### allowFallbackChains?

`boolean`

#### allowMultipleWalletsPerChain?

`boolean`

## Returns

### allowFallbackChains?

> `optional` **allowFallbackChains**: `boolean`

Whether to allow fallback chains when required chains aren't available

### allowMultipleWalletsPerChain?

> `optional` **allowMultipleWalletsPerChain**: `boolean`

Whether to allow multiple wallets per chain

### chainsByTech

> **chainsByTech**: `Record`\<`string`, `object`[]\>

Chains organized by technology/type

## Example

```typescript
import { createAllChainsConfig } from '@walletmesh/modal/chains';

// All chains (mainnet and testnet)
const config = createAllChainsConfig();

// With custom options
const customConfig = createAllChainsConfig({
  allowMultipleWalletsPerChain: true,
  allowFallbackChains: true
});
```
