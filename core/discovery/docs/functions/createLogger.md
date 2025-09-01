[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / createLogger

# Function: createLogger()

> **createLogger**(`options?`): [`Logger`](../interfaces/Logger.md)

Defined in: [core/logger.ts:106](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/logger.ts#L106)

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
