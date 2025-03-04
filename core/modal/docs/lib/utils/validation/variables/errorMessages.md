[**@walletmesh/modal v0.0.7**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/utils/validation](../README.md) / errorMessages

# Variable: errorMessages

> `const` **errorMessages**: `object`

Defined in: [core/modal/src/lib/utils/validation.ts:95](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/utils/validation.ts#L95)

Standard error messages for validation failures.

Provides consistent error messaging across the application
for common validation and connection errors.

## Type declaration

### notConnected

> **notConnected**: `string` = `'Transport not connected'`

### invalidMessage

> **invalidMessage**: `string` = `'Invalid message format'`

### invalidOrigin

> **invalidOrigin**: `string` = `'Invalid message origin'`

## Example

```typescript
if (!transport.isConnected()) {
  throw new Error(errorMessages.notConnected);
}

if (!isValidMessage(data)) {
  throw new Error(errorMessages.invalidMessage);
}
```
