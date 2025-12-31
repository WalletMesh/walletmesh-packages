[**@walletmesh/discovery v0.1.3**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ConsoleLogger

# Class: ConsoleLogger

Defined in: [core/discovery/src/core/logger.ts:45](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/core/logger.ts#L45)

Console logger implementation that writes to console.
Used as the default logger when none is provided.

## Since

0.1.0

## Implements

- [`Logger`](../interfaces/Logger.md)

## Constructors

### Constructor

> **new ConsoleLogger**(`prefix`): `ConsoleLogger`

Defined in: [core/discovery/src/core/logger.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/core/logger.ts#L48)

#### Parameters

##### prefix

`string` = `'[WalletMesh]'`

#### Returns

`ConsoleLogger`

## Methods

### debug()

> **debug**(`message`, `data?`): `void`

Defined in: [core/discovery/src/core/logger.ts:52](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/core/logger.ts#L52)

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

#### Implementation of

[`Logger`](../interfaces/Logger.md).[`debug`](../interfaces/Logger.md#debug)

***

### error()

> **error**(`message`, `error?`): `void`

Defined in: [core/discovery/src/core/logger.ts:76](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/core/logger.ts#L76)

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

#### Implementation of

[`Logger`](../interfaces/Logger.md).[`error`](../interfaces/Logger.md#error)

***

### info()

> **info**(`message`, `data?`): `void`

Defined in: [core/discovery/src/core/logger.ts:60](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/core/logger.ts#L60)

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

#### Implementation of

[`Logger`](../interfaces/Logger.md).[`info`](../interfaces/Logger.md#info)

***

### warn()

> **warn**(`message`, `data?`): `void`

Defined in: [core/discovery/src/core/logger.ts:68](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/core/logger.ts#L68)

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

#### Implementation of

[`Logger`](../interfaces/Logger.md).[`warn`](../interfaces/Logger.md#warn)
