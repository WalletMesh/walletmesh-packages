[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isChainSupported

# Function: isChainSupported()

> **isChainSupported**(`config`, `chainId`): `boolean`

Check if a chain ID is supported in a configuration

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
