[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createDebugLogger

# Function: createDebugLogger()

> **createDebugLogger**(`prefix`, `debug?`): [`Logger`](../classes/Logger.md)

Creates a debug logger with a specified prefix.

## Parameters

### prefix

`string`

The prefix to use for log messages

### debug?

`boolean` = `false`

Whether to enable debug mode

## Returns

[`Logger`](../classes/Logger.md)

A new Logger instance

## Example

```typescript
const logger = createDebugLogger('MyComponent');
logger.debug('Initializing...'); // Only logged when debug mode is enabled
logger.info('Ready'); // Always logged
```
