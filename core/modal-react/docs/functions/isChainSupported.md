[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / isChainSupported

# Function: isChainSupported()

> **isChainSupported**(`config`, `chainId`): `boolean`

Defined in: core/modal-core/dist/chains/multichain.d.ts:138

Check if a chain ID is supported in a configuration

## Parameters

### config

#### allowFallbackChains?

`boolean`

#### allowMultipleWalletsPerChain?

`boolean`

#### chainsByTech

`Record`\<`string`, `object`[]\>

### chainId

`string`

## Returns

`boolean`

## Example

```typescript
import { createMainnetConfig, isChainSupported } from '@walletmesh/modal/chains';

const config = createMainnetConfig();
const isEthereumSupported = isChainSupported(config, 'eip155:1'); // true
const isTestnetSupported = isChainSupported(config, 'eip155:11155111'); // false
```
