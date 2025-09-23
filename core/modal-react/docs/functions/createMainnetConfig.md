[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / createMainnetConfig

# Function: createMainnetConfig()

> **createMainnetConfig**(`options?`): `object`

Defined in: core/modal-core/dist/chains/multichain.d.ts:27

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

`object`

### allowFallbackChains?

> `optional` **allowFallbackChains**: `boolean`

### allowMultipleWalletsPerChain?

> `optional` **allowMultipleWalletsPerChain**: `boolean`

### chainsByTech

> **chainsByTech**: `Record`\<`string`, `object`[]\>

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
