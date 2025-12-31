[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / createTestnetConfig

# Function: createTestnetConfig()

> **createTestnetConfig**(`options?`): `object`

Defined in: core/modal-core/dist/chains/multichain.d.ts:52

Create a multi-chain configuration with testnet chains only

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
import { createTestnetConfig } from '@walletmesh/modal/chains';

// All testnets
const config = createTestnetConfig();

// Only EVM testnets
const evmTestConfig = createTestnetConfig({
  includeEvm: true,
  includeSolana: false,
  includeAztec: false
});
```
