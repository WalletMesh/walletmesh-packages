[**@walletmesh/discovery v0.1.4**](../README.md)

***

[@walletmesh/discovery](../globals.md) / RETRYABLE\_ERROR\_CODES

# Variable: RETRYABLE\_ERROR\_CODES

> `const` `readonly` **RETRYABLE\_ERROR\_CODES**: `Set`\<`1006` \| `2002` \| `3005` \| `4001` \| `4006` \| `5001` \| `5002` \| `5003` \| `5005`\>

Defined in: [core/discovery/src/core/constants.ts:554](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/core/constants.ts#L554)

Retryable error codes indicating transient failures.

Set of error codes that indicate transient failures which can be
resolved by retrying the operation. Used to implement retry logic
with exponential backoff. These errors typically represent temporary
conditions like rate limits, timeouts, or resource constraints.

## Examples

```typescript
async function retryableOperation(fn: () => Promise<void>) {
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      await fn();
      return;
    } catch (error) {
      if (error.code && RETRYABLE_ERROR_CODES.has(error.code)) {
        attempts++;
        const delay = Math.min(1000 * Math.pow(2, attempts), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error; // Non-retryable error
      }
    }
  }
  throw new Error('Max retry attempts exceeded');
}
```

```typescript
function isRetryable(errorCode: number): boolean {
  return RETRYABLE_ERROR_CODES.has(errorCode);
}
```

## Since

0.1.0

## See

 - [ERROR\_CODES](ERROR_CODES.md) for error code definitions
 - [ERROR\_MESSAGES](ERROR_MESSAGES.md) for error descriptions
