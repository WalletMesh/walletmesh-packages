[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getErrorTitle

# Function: getErrorTitle()

> **getErrorTitle**(`error`): `string`

Get user-friendly error title based on error type

Provides a concise, user-friendly title for common error codes.

## Parameters

### error

[`FormattedError`](../interfaces/FormattedError.md)

The formatted error

## Returns

`string`

User-friendly error title

## Example

```typescript
const formatted = formatError(error);
const title = getErrorTitle(formatted);
showErrorDialog(title, formatted.message);
```

## Since

3.0.0
