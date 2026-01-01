[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / QueryManager

# Class: QueryManager

Service for managing queries and mutations using TanStack Query Core

The QueryManager provides a central query client that can be used across
all WalletMesh services for consistent data fetching and caching. It's
designed to be framework-agnostic, allowing UI frameworks to create their
own adapters on top of this core functionality.

## Remarks

This service integrates with other WalletMesh services to provide:
- Automatic cache invalidation on wallet events
- Standardized query key patterns
- Consistent error handling
- Smart refetching strategies

## Example

```typescript
const queryManager = new QueryManager({
  logger: createLogger('QueryManager'),
  queryConfig: {
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,      // 30 seconds
        gcTime: 5 * 60 * 1000,      // 5 minutes
        retry: 3,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 1,
      },
    },
  },
});

// Get the query client for direct usage
const queryClient = queryManager.getQueryClient();

// Fetch data using the query client
const data = await queryClient.fetchQuery({
  queryKey: ['balance', address, chainId],
  queryFn: () => fetchBalance(address, chainId),
});
```

## Constructors

### Constructor

> **new QueryManager**(`dependencies`): `QueryManager`

Creates a new QueryManager instance

#### Parameters

##### dependencies

[`QueryManagerDependencies`](../interfaces/QueryManagerDependencies.md)

Required service dependencies

#### Returns

`QueryManager`

#### Example

```typescript
const queryManager = new QueryManager({
  logger: createLogger('QueryManager'),
  queryConfig: {
    defaultOptions: {
      queries: { staleTime: 60000 }
    }
  }
});
```

## Methods

### cleanup()

> **cleanup**(): `void`

Clean up resources

Cancels all queries and clears the cache. Should be called
when the QueryManager is no longer needed.

#### Returns

`void`

#### Example

```typescript
// On service cleanup
queryManager.cleanup();
```

***

### clear()

> **clear**(): `void`

Clear all queries and reset the cache

Removes all cached data and cancels any in-flight queries.
Useful when disconnecting a wallet or switching accounts.

#### Returns

`void`

#### Example

```typescript
// On wallet disconnect
queryManager.clear();
```

***

### getQueryClient()

> **getQueryClient**(): `QueryClient`

Get the underlying QueryClient instance

Returns the TanStack Query client for direct usage. This allows
framework adapters and services to access all query client methods
including fetchQuery, prefetchQuery, invalidateQueries, etc.

#### Returns

`QueryClient`

The QueryClient instance

#### Example

```typescript
const queryClient = queryManager.getQueryClient();

// Invalidate all balance queries
await queryClient.invalidateQueries({
  queryKey: ['balance']
});

// Remove all queries on disconnect
queryClient.removeQueries();
```
