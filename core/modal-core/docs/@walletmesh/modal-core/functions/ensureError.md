[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ensureError

# Function: ensureError()

> **ensureError**(`value`): `Error`

**`Function`**

Convert unknown values to proper Error instances with stack traces

This utility implements best practices for error handling by ensuring that any
value thrown or caught can be converted to a proper Error instance with a stack trace.

 ensureError

## Parameters

### value

`unknown`

Unknown value that might be an error

## Returns

`Error`

Error instance with preserved information and stack trace

## Example

```typescript
try {
  riskyOperation();
} catch (error) {  // error is 'unknown'
  const properError = ensureError(error);
  logger.error(properError.message, properError.stack);
}
```
