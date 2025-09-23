[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / TransactionServiceDependencies

# Interface: TransactionServiceDependencies

Dependencies required by TransactionService.

Extends the base service dependencies to inherit common requirements like logging.
Currently no additional dependencies are required beyond the base.

## Example

```typescript
const dependencies: TransactionServiceDependencies = {
  logger: createLogger('TransactionService')
};

const txService = new TransactionService(dependencies);
```

## Extends

- [`BaseServiceDependencies`](BaseServiceDependencies.md)

## Properties

### logger

> **logger**: [`Logger`](../classes/Logger.md)

Logger instance for service debugging and error tracking

#### Inherited from

[`BaseServiceDependencies`](BaseServiceDependencies.md).[`logger`](BaseServiceDependencies.md#logger)
