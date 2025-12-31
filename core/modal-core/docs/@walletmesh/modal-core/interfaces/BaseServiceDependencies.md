[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / BaseServiceDependencies

# Interface: BaseServiceDependencies

Base dependencies required by all services

This interface defines the common dependencies that every service
in the WalletMesh system requires. Service-specific dependency
interfaces should extend this base interface.

## Extended by

- [`WalletPreferenceServiceDependencies`](WalletPreferenceServiceDependencies.md)
- [`QueryManagerDependencies`](QueryManagerDependencies.md)
- [`BalanceServiceDependencies`](BalanceServiceDependencies.md)
- [`ChainServiceDependencies`](ChainServiceDependencies.md)
- [`ConnectionServiceDependencies`](ConnectionServiceDependencies.md)
- [`HealthServiceDependencies`](HealthServiceDependencies.md)
- [`SessionServiceDependencies`](SessionServiceDependencies.md)
- [`UIServiceDependencies`](UIServiceDependencies.md)
- [`TransactionServiceDependencies`](TransactionServiceDependencies.md)
- [`DAppRpcServiceDependencies`](DAppRpcServiceDependencies.md)

## Properties

### logger

> **logger**: [`Logger`](../classes/Logger.md)

Logger instance for service debugging and error tracking
