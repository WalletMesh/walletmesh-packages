[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / Logger

# Class: Logger

Simple logger utility

## Implements

- [`Disposable`](../interfaces/Disposable.md)

## Constructors

### Constructor

> **new Logger**(`debugEnabled`, `prefix?`): `Logger`

Create a new logger instance

#### Parameters

##### debugEnabled

Enable debug logging (boolean) or function that returns debug state

`boolean` | () => `boolean`

##### prefix?

`string` = `'Modal'`

Prefix for all log messages

#### Returns

`Logger`

#### Examples

```ts
// Static debug mode
const logger = new Logger(true, 'MyComponent');
```

```ts
// Dynamic debug mode
const logger = new Logger(() => process.env.NODE_ENV === 'development', 'MyComponent');
```

## Methods

### debug()

> **debug**(`message`, `data?`): `void`

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

Clean up logger resources

#### Returns

`void`

#### Implementation of

[`Disposable`](../interfaces/Disposable.md).[`dispose`](../interfaces/Disposable.md#dispose)

***

### error()

> **error**(`message`, `error?`): `void`

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
