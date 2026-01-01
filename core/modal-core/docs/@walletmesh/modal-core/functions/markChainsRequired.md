[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / markChainsRequired

# Function: markChainsRequired()

> **markChainsRequired**(`config`, `requiredChainIds`): `object`

Mark specific chains as required in a configuration

## Parameters

### config

#### allowFallbackChains?

`boolean` = `...`

Whether to allow fallback chains when required chains aren't available

#### allowMultipleWalletsPerChain?

`boolean` = `...`

Whether to allow multiple wallets per chain

#### chainsByTech

`Record`\<`string`, `object`[]\> = `...`

Chains organized by technology/type

### requiredChainIds

`string`[]

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
import { createMainnetConfig, markChainsRequired } from '@walletmesh/modal/chains';

const config = createMainnetConfig();
const requiredConfig = markChainsRequired(config, ['eip155:1', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp']); // Ethereum and Solana required
```
