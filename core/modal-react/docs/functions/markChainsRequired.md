[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / markChainsRequired

# Function: markChainsRequired()

> **markChainsRequired**(`config`, `requiredChainIds`): `object`

Defined in: core/modal-core/dist/chains/multichain.d.ts:110

Mark specific chains as required in a configuration

## Parameters

### config

#### allowFallbackChains?

`boolean`

#### allowMultipleWalletsPerChain?

`boolean`

#### chainsByTech

`Record`\<`string`, `object`[]\>

### requiredChainIds

`string`[]

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
import { createMainnetConfig, markChainsRequired } from '@walletmesh/modal/chains';

const config = createMainnetConfig();
const requiredConfig = markChainsRequired(config, ['eip155:1', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp']); // Ethereum and Solana required
```
