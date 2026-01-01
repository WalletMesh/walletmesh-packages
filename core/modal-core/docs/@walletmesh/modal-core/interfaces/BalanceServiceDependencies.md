[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / BalanceServiceDependencies

# Interface: BalanceServiceDependencies

Dependencies required by BalanceService

Extends the base service dependencies with chain service registry for
blockchain-specific balance operations. The registry enables lazy loading
of chain services and proper separation of concerns.

## Example

```typescript
const dependencies: BalanceServiceDependencies = {
  logger: createLogger('BalanceService'),
  chainServiceRegistry: new ChainServiceRegistry()
};
```

## Extends

- [`BaseServiceDependencies`](BaseServiceDependencies.md)

## Properties

### chainServiceRegistry

> **chainServiceRegistry**: [`ChainServiceRegistry`](../../../internal/types/typedocExports/interfaces/ChainServiceRegistry.md)

Registry for chain-specific services

Provides access to blockchain-specific implementations for balance queries.
The registry determines which service to use based on the chain ID and
loads services on-demand to reduce bundle size.

***

### logger

> **logger**: [`Logger`](../classes/Logger.md)

Logger instance for service debugging and error tracking

#### Inherited from

[`BaseServiceDependencies`](BaseServiceDependencies.md).[`logger`](BaseServiceDependencies.md#logger)
