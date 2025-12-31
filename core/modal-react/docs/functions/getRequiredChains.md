[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / getRequiredChains

# Function: getRequiredChains()

> **getRequiredChains**(`config`): `object`[]

Defined in: core/modal-core/dist/chains/multichain.d.ts:150

Get all required chains from a configuration

## Parameters

### config

#### allowFallbackChains?

`boolean`

#### allowMultipleWalletsPerChain?

`boolean`

#### chainsByTech

`Record`\<`string`, `object`[]\>

## Returns

`object`[]

## Example

```typescript
import { createMainnetConfig, getRequiredChains } from '@walletmesh/modal/chains';

const config = createMainnetConfig();
const requiredChains = getRequiredChains(config);
```
