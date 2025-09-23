[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createCustomConfig

# Function: createCustomConfig()

> **createCustomConfig**(`chains`, `options?`): `object`

Create a custom chain configuration

## Parameters

### chains

`Partial`\<`Record`\<[`ChainType`](../enumerations/ChainType.md), [`SupportedChain`](../type-aliases/SupportedChain.md)[]\>\>

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
import { createCustomConfig, ethereumMainnet, solanaMainnet } from '@walletmesh/modal/chains';

// Custom selection of chains
const config = createCustomConfig({
  evm: [ethereumMainnet],
  solana: [solanaMainnet],
  aztec: []
});
```
