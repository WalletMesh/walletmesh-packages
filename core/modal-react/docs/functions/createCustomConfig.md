[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / createCustomConfig

# Function: createCustomConfig()

> **createCustomConfig**(`chains`, `options?`): `object`

Defined in: core/modal-core/dist/chains/multichain.d.ts:95

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

`object`

### allowFallbackChains?

> `optional` **allowFallbackChains**: `boolean`

### allowMultipleWalletsPerChain?

> `optional` **allowMultipleWalletsPerChain**: `boolean`

### chainsByTech

> **chainsByTech**: `Record`\<`string`, `object`[]\>

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
