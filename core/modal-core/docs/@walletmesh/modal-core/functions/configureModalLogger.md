[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / configureModalLogger

# Function: configureModalLogger()

> **configureModalLogger**(`debug`, `prefix?`): [`Logger`](../classes/Logger.md)

Configure the global modal logger

## Parameters

### debug

`boolean`

Whether to enable debug logging

### prefix?

`string`

Optional custom prefix for log messages

## Returns

[`Logger`](../classes/Logger.md)

The configured logger instance

## Example

```typescript
import { configureModalLogger } from '@walletmesh/modal-core';

// Enable debug logging
configureModalLogger(true);

// Custom prefix
configureModalLogger(true, 'MyApp:Modal');
```
