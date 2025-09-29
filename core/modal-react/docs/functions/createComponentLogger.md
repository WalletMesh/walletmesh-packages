[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / createComponentLogger

# Function: createComponentLogger()

> **createComponentLogger**(`name`, `debug?`): [`Logger`](../interfaces/Logger.md)

Defined in: [core/modal-react/src/utils/logger.ts:176](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/utils/logger.ts#L176)

Create a named logger for a specific component or module

Creates a new logger instance with a hierarchical name for better
log organization and filtering. Each component gets its own logger
with a unique prefix.

## Parameters

### name

`string`

Component or module name (e.g., 'ConnectButton', 'useAccount')

### debug?

`boolean`

Optional debug flag to override environment detection

## Returns

[`Logger`](../interfaces/Logger.md)

Logger instance with prefixed name

## Examples

```typescript
// In a React component
const logger = createComponentLogger('WalletList');

useEffect(() => {
  logger.debug('Component mounted', { walletCount: wallets.length });
  return () => logger.debug('Component unmounted');
}, []);

// In a custom hook
function useCustomHook() {
  const logger = createComponentLogger('useCustomHook', true); // Force debug
  logger.debug('Hook called');
}
```

```typescript
// Advanced usage with error handling
const logger = createComponentLogger('DataFetcher');

async function fetchData() {
  try {
    logger.info('Fetching data...');
    const data = await api.getData();
    logger.debug('Data received', { count: data.length });
    return data;
  } catch (error) {
    logger.error('Failed to fetch data', error);
    throw error;
  }
}
```
