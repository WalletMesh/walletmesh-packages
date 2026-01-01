[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / filterChainsByGroup

# Function: filterChainsByGroup()

> **filterChainsByGroup**(`chains`, `group`): `object`[]

Defined in: core/modal-core/dist/chains/multichain.d.ts:125

Filter chains by group

## Parameters

### chains

`object`[]

### group

`string`

## Returns

`object`[]

## Example

```typescript
import { evmChains, filterChainsByGroup } from '@walletmesh/modal/chains';

// Get only Ethereum chains
const ethereumChains = filterChainsByGroup(evmChains, 'ethereum');

// Get Polygon chains
const polygonChains = filterChainsByGroup(evmChains, 'polygon');
```
