[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getRequiredChains

# Function: getRequiredChains()

> **getRequiredChains**(`config`): `object`[]

Get all required chains from a configuration

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

## Returns

## Example

```typescript
import { createMainnetConfig, getRequiredChains } from '@walletmesh/modal/chains';

const config = createMainnetConfig();
const requiredChains = getRequiredChains(config);
```
