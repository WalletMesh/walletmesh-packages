[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainServiceDependencies

# Interface: ChainServiceDependencies

Dependencies required by ChainService

## Example

```ts
const dependencies: ChainServiceDependencies = {
  logger: new Logger(),
  eventEmitter: new EventEmitter(),
  resourceManager: new ResourceManager()
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
