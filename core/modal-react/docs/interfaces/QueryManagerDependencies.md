[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / QueryManagerDependencies

# Interface: QueryManagerDependencies

Defined in: core/modal-core/dist/services/query/QueryManager.d.ts:32

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

- `BaseServiceDependencies`

## Properties

### logger

> **logger**: [`Logger`](Logger.md)

Defined in: core/modal-core/dist/services/base/ServiceDependencies.d.ts:24

Logger instance for service debugging and error tracking

#### Inherited from

`BaseServiceDependencies.logger`

***

### queryConfig?

> `optional` **queryConfig**: `QueryClientConfig`

Defined in: core/modal-core/dist/services/query/QueryManager.d.ts:40

Optional TanStack Query configuration

Allows customization of query client behavior including
default query options, mutation options, and cache settings.
If not provided, sensible defaults will be used.
