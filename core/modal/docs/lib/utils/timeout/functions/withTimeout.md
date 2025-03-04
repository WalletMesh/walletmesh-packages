[**@walletmesh/modal v0.0.7**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/utils/timeout](../README.md) / withTimeout

# Function: withTimeout()

> **withTimeout**\<`T`\>(`promise`, `timeoutMs`, `operation`): `Promise`\<`T`\>

Defined in: [core/modal/src/lib/utils/timeout.ts:102](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/utils/timeout.ts#L102)

Adds timeout functionality to any Promise-based operation.

Wraps a promise with a timeout mechanism that will reject
if the operation doesn't complete within the specified time.
Uses Promise.race internally to implement the timeout.

## Type Parameters

• **T**

The type of value that the promise resolves to

## Parameters

### promise

`Promise`\<`T`\>

The promise to wrap with a timeout

### timeoutMs

`number`

The timeout duration in milliseconds

### operation

`string`

The name of the operation for error reporting

## Returns

`Promise`\<`T`\>

Promise that resolves with the original value or rejects with TimeoutError

## Example

```typescript
// Wrap a wallet connection with 30 second timeout
const result = await withTimeout(
  wallet.connect(),
  30000,
  'Wallet Connection'
);

// Using with custom error handling
try {
  const result = await withTimeout(
    slowOperation(),
    5000,
    'Slow Operation'
  );
} catch (error) {
  if (error instanceof TimeoutError) {
    // Handle timeout specifically
    handleTimeout();
  } else {
    // Handle other errors
    handleError(error);
  }
}
```

## Remarks

The timeout is implemented using Promise.race between the original
promise and a timeout promise. When the timeout triggers, the original
operation may continue running in the background even though the
promise has rejected.
