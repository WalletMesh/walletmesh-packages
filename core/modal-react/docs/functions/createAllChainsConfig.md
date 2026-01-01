[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / createAllChainsConfig

# Function: createAllChainsConfig()

> **createAllChainsConfig**(`options?`): `object`

Defined in: core/modal-core/dist/chains/multichain.d.ts:76

Create a multi-chain configuration with all available chains

## Parameters

### options?

#### allowFallbackChains?

`boolean`

#### allowMultipleWalletsPerChain?

`boolean`

## Returns

`object`

### allowFallbackChains?

> `optional` **allowFallbackChains**: `boolean`

### allowMultipleWalletsPerChain?

> `optional` **allowMultipleWalletsPerChain**: `boolean`

### chainsByTech

> **chainsByTech**: `Record`\<`string`, `object`[]\>

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
