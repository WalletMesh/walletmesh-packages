[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createTestnetConfig

# Function: createTestnetConfig()

> **createTestnetConfig**(`options?`): `object`

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
