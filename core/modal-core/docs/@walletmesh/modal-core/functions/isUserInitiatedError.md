[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isUserInitiatedError

# Function: isUserInitiatedError()

> **isUserInitiatedError**(`error`): `boolean`

Check if error is due to user action and not a system failure

Helps distinguish between user-initiated cancellations and actual errors.
Useful for deciding whether to show error UI or silently handle the rejection.

## Parameters

### error

[`FormattedError`](../interfaces/FormattedError.md)

The formatted error

## Returns

`boolean`

True if user initiated the error (e.g., rejection)

## Example

```typescript
const formatted = formatError(error);
if (!isUserInitiatedError(formatted)) {
  // Only show error UI for non-user-initiated errors
  showErrorNotification(formatted);
}
```

## Since

3.0.0
