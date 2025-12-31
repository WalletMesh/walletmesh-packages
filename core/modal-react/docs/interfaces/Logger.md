[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / Logger

# Interface: Logger

Defined in: core/modal-core/dist/internal/core/logger/logger.d.ts:47

Simple logger utility

## Implements

- [`Disposable`](Disposable.md)

## Methods

### debug()

> **debug**(`message`, `data?`): `void`

Defined in: core/modal-core/dist/internal/core/logger/logger.d.ts:86

Log debug message (only when debug is enabled)

#### Parameters

##### message

`string`

Debug message to log

##### data?

`unknown`

Optional data to include with the message (will be sanitized)

#### Returns

`void`

#### Example

```ts
logger.debug('Processing request', { userId: '123', action: 'login' });
logger.debug('Component mounted');
```

***

### dispose()

> **dispose**(): `void`

Defined in: core/modal-core/dist/internal/core/logger/logger.d.ts:117

Clean up logger resources

#### Returns

`void`

#### Implementation of

`Disposable.dispose`

***

### error()

> **error**(`message`, `error?`): `void`

Defined in: core/modal-core/dist/internal/core/logger/logger.d.ts:113

Log error message

#### Parameters

##### message

`string`

Error message to log

##### error?

`unknown`

Optional error object or data to include (will be sanitized)

#### Returns

`void`

#### Example

```typescript
logger.error('Connection failed', new Error('Network timeout'));
logger.error('Validation failed', { field: 'email', value: 'invalid' });
```

***

### info()

> **info**(`message`, `data?`): `void`

Defined in: core/modal-core/dist/internal/core/logger/logger.d.ts:93

Log info message

#### Parameters

##### message

`string`

Information message to log

##### data?

`unknown`

Optional data to include with the message (will be sanitized)

#### Returns

`void`

***

### setLevel()

> **setLevel**(`level`): `void`

Defined in: core/modal-core/dist/internal/core/logger/logger.d.ts:75

Set the log level for this logger

#### Parameters

##### level

[`LogLevel`](../enumerations/LogLevel.md)

The minimum log level to output

#### Returns

`void`

#### Example

```ts
const logger = new Logger(false, 'Test');
logger.setLevel(LogLevel.DEBUG); // Enable debug logging
logger.setLevel(LogLevel.ERROR); // Only show errors
```

***

### warn()

> **warn**(`message`, `data?`): `void`

Defined in: core/modal-core/dist/internal/core/logger/logger.d.ts:100

Log warning message

#### Parameters

##### message

`string`

Warning message to log

##### data?

`unknown`

Optional data to include with the message (will be sanitized)

#### Returns

`void`
