[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / Logger

# Interface: Logger

Defined in: [core/discovery/src/core/logger.ts:8](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/core/logger.ts#L8)

Logger interface for the discovery package.
Compatible with modal-core's Logger interface.

## Since

0.1.0

## Methods

### debug()

> **debug**(`message`, `data?`): `void`

Defined in: [core/discovery/src/core/logger.ts:14](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/core/logger.ts#L14)

Log debug message (only when debug is enabled)

#### Parameters

##### message

`string`

Debug message to log

##### data?

`unknown`

Optional data to include with the message

#### Returns

`void`

***

### error()

> **error**(`message`, `error?`): `void`

Defined in: [core/discovery/src/core/logger.ts:35](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/core/logger.ts#L35)

Log error message

#### Parameters

##### message

`string`

Error message to log

##### error?

`unknown`

Optional error object or data to include

#### Returns

`void`

***

### info()

> **info**(`message`, `data?`): `void`

Defined in: [core/discovery/src/core/logger.ts:21](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/core/logger.ts#L21)

Log info message

#### Parameters

##### message

`string`

Information message to log

##### data?

`unknown`

Optional data to include with the message

#### Returns

`void`

***

### warn()

> **warn**(`message`, `data?`): `void`

Defined in: [core/discovery/src/core/logger.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/core/logger.ts#L28)

Log warning message

#### Parameters

##### message

`string`

Warning message to log

##### data?

`unknown`

Optional data to include with the message

#### Returns

`void`
