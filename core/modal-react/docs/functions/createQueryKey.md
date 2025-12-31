[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / createQueryKey

# Function: createQueryKey()

> **createQueryKey**(`domain`, ...`keys`): readonly `unknown`[]

Defined in: core/modal-core/dist/services/query/queryKeys.d.ts:363

Helper function to create custom query keys

Use this when you need query keys that don't fit the standard patterns.
Ensures all custom keys are still under the WalletMesh namespace.

## Parameters

### domain

`string`

The query domain (e.g., 'custom', 'plugin')

### keys

...readonly `unknown`[]

Additional key segments

## Returns

readonly `unknown`[]

Custom query key

## Example

```typescript
const customKey = createQueryKey('nft', 'collection', collectionId);
// Returns: ['walletmesh', 'nft', 'collection', collectionId]
```
