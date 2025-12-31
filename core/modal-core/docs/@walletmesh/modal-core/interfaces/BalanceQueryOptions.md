[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / BalanceQueryOptions

# Interface: BalanceQueryOptions

Balance query options

Configuration options for individual balance queries. These options override
the default service configuration for specific queries, allowing fine-grained
control over caching behavior.

## Examples

```typescript
const options: BalanceQueryOptions = {
  useCache: false  // Bypass cache, fetch fresh data
};
```

```typescript
const options: BalanceQueryOptions = {
  useCache: true,
  staleTime: 5000  // Consider data fresh for 5 seconds
};
```

## Properties

### cacheTime?

> `optional` **cacheTime**: `number`

Cache time in milliseconds

How long the fetched balance should be kept in cache before
being automatically removed. Overrides the service's default.

#### Default

```ts
300000 (5 minutes)
```

#### Example

```ts
60000 for 1 minute, 3600000 for 1 hour
```

***

### staleTime?

> `optional` **staleTime**: `number`

Stale time in milliseconds

How long cached data is considered fresh. Within this time,
cached data is returned immediately without checking the blockchain.
After this time, data is still returned from cache but a background
refresh may be triggered.

#### Default

```ts
30000 (30 seconds)
```

#### Example

```ts
5000 for 5 seconds (frequent updates), 300000 for 5 minutes (stable values)
```

***

### useCache?

> `optional` **useCache**: `boolean`

Whether to use cache

Controls whether to check the cache before making an RPC call.
Set to false to force a fresh fetch from the blockchain.

#### Default

```ts
true
```
