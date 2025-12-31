[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createQueryKey

# Function: createQueryKey()

> **createQueryKey**(`domain`, ...`keys`): readonly `unknown`[]

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
