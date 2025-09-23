[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / filterChainsByGroup

# Function: filterChainsByGroup()

> **filterChainsByGroup**(`chains`, `group`): `object`[]

Filter chains by group

## Parameters

### chains

`object`[]

### group

`string`

## Returns

## Example

```typescript
import { evmChains, filterChainsByGroup } from '@walletmesh/modal/chains';

// Get only Ethereum chains
const ethereumChains = filterChainsByGroup(evmChains, 'ethereum');

// Get Polygon chains
const polygonChains = filterChainsByGroup(evmChains, 'polygon');
```
