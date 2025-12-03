[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createMainnetConfig

# Function: createMainnetConfig()

> **createMainnetConfig**(`options?`): `object`

Create a multi-chain configuration with mainnet chains only

## Parameters

### options?

#### allowFallbackChains?

`boolean`

#### allowMultipleWalletsPerChain?

`boolean`

#### includeAztec?

`boolean`

#### includeEvm?

`boolean`

#### includeSolana?

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
import { createMainnetConfig } from '@walletmesh/modal/chains';

// All mainnets
const config = createMainnetConfig();

// Only EVM and Solana mainnets
const evmSolanaConfig = createMainnetConfig({
  includeEvm: true,
  includeSolana: true,
  includeAztec: false
});
```
