[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / formatError

# Function: formatError()

> **formatError**(`error`): [`FormattedError`](../interfaces/FormattedError.md)

Format an error for display in the UI

Takes any error type and converts it to a structured format suitable
for display in UI components. Extracts error codes, messages, and
recovery hints when available.

## Parameters

### error

`unknown`

The error to format (can be any type)

## Returns

[`FormattedError`](../interfaces/FormattedError.md)

Formatted error information with message, code, recovery hint, etc.

## Example

```typescript
try {
  await wallet.connect();
} catch (error) {
  const formatted = formatError(error);
  console.log(formatted.message); // User-friendly error message
  if (formatted.recoveryHint) {
    console.log(getRecoveryMessage(formatted.recoveryHint));
  }
}
```

## Since

3.0.0
