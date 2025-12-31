[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / createDebugLogger

# Function: createDebugLogger()

> **createDebugLogger**(`prefix`, `debug?`): [`Logger`](../interfaces/Logger.md)

Defined in: core/modal-core/dist/internal/core/logger/logger.d.ts:155

Creates a debug logger with a specified prefix.

## Parameters

### prefix

`string`

The prefix to use for log messages

### debug?

`boolean`

Whether to enable debug mode

## Returns

[`Logger`](../interfaces/Logger.md)

A new Logger instance

## Example

```typescript
const logger = createDebugLogger('MyComponent');
logger.debug('Initializing...'); // Only logged when debug mode is enabled
logger.info('Ready'); // Always logged
```
