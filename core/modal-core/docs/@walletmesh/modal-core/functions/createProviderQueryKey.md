[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createProviderQueryKey

# Function: createProviderQueryKey()

> **createProviderQueryKey**(`chainId`, `method`, ...`params`): `unknown`[]

Create a query key for caching provider queries

Generates a consistent cache key for provider queries that can be used
with caching libraries like TanStack Query.

## Parameters

### chainId

Chain ID

`undefined` | `string`

### method

`string`

RPC method name

### params

...`unknown`[]

Method parameters

## Returns

`unknown`[]

Array suitable for use as a query key

## Example

```typescript
const queryKey = createProviderQueryKey('1', 'eth_getBalance', ['0x123...', 'latest']);
// Returns: ['providerQuery', '1', 'eth_getBalance', '0x123...', 'latest']
```
