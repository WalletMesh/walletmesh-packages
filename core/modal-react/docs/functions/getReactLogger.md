[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / getReactLogger

# Function: getReactLogger()

> **getReactLogger**(`debug?`, `prefix?`): [`Logger`](../interfaces/Logger.md)

Defined in: [core/modal-react/src/utils/logger.ts:113](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/utils/logger.ts#L113)

Get or create the global logger instance

This function implements a singleton pattern to ensure all React components
use the same logger instance. It supports runtime configuration changes.

## Parameters

### debug?

`boolean`

Optional debug flag to override environment detection

### prefix?

`string` = `'WalletMesh:React'`

Optional prefix for log messages (default: 'WalletMesh:React')

## Returns

[`Logger`](../interfaces/Logger.md)

Logger instance configured for React usage

## Examples

```typescript
// Get default logger
const logger = getLogger();
logger.info('Application started');

// Enable debug mode explicitly
const debugLogger = getLogger(true);
debugLogger.debug('Detailed information');
```

```typescript
// Use in a React hook
function useCustomHook() {
  const logger = getLogger();

  useEffect(() => {
    logger.debug('Hook mounted');
    return () => logger.debug('Hook unmounted');
  }, []);
}
```
