[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / createLogger

# Function: createLogger()

> **createLogger**(`options?`): [`Logger`](../interfaces/Logger.md)

Defined in: [core/logger.ts:106](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/logger.ts#L106)

Create a logger instance with the specified options.

## Parameters

### options?

Logger creation options

#### logger?

[`Logger`](../interfaces/Logger.md)

#### prefix?

`string`

## Returns

[`Logger`](../interfaces/Logger.md)

Logger instance

## Example

```typescript
// Use default console logger
const logger = createLogger();

// Use custom prefix
const logger = createLogger({ prefix: '[Discovery]' });

// Use custom logger implementation
const logger = createLogger({ logger: myCustomLogger });
```

## Since

0.1.0
