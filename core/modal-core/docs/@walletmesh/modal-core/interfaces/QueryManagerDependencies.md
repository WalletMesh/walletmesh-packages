[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / QueryManagerDependencies

# Interface: QueryManagerDependencies

Dependencies required by QueryManager

Extends the base service dependencies with optional query configuration.
The QueryManager uses TanStack Query Core for framework-agnostic data management.

## Example

```typescript
const dependencies: QueryManagerDependencies = {
  logger: createLogger('QueryManager'),
  queryConfig: {
    defaultOptions: {
      queries: { staleTime: 60000 }
    }
  }
};
```

## Extends

- [`BaseServiceDependencies`](BaseServiceDependencies.md)

## Properties

### logger

> **logger**: [`Logger`](../classes/Logger.md)

Logger instance for service debugging and error tracking

#### Inherited from

[`BaseServiceDependencies`](BaseServiceDependencies.md).[`logger`](BaseServiceDependencies.md#logger)

***

### queryConfig?

> `optional` **queryConfig**: `QueryClientConfig`

Optional TanStack Query configuration

Allows customization of query client behavior including
default query options, mutation options, and cache settings.
If not provided, sensible defaults will be used.
