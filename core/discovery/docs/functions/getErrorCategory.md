[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / getErrorCategory

# Function: getErrorCategory()

> **getErrorCategory**(`code`): [`ErrorCategory`](../type-aliases/ErrorCategory.md) \| `"unknown"`

Defined in: [core/discovery/src/core/constants.ts:681](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/core/constants.ts#L681)

Get error category from error code.

Determines the category of an error based on its numeric code range.
Useful for error handling logic that needs to respond differently
to different types of errors.

## Parameters

### code

`number`

The numeric error code

## Returns

[`ErrorCategory`](../type-aliases/ErrorCategory.md) \| `"unknown"`

The error category or 'unknown' if code is invalid

## Example

```typescript
const category = getErrorCategory(2001); // 'security'
const category = getErrorCategory(3002); // 'capability'

switch (getErrorCategory(error.code)) {
  case 'security':
    logSecurityIncident(error);
    break;
  case 'capability':
    // Silent failure
    break;
  default:
    sendErrorResponse(error);
}
```

## Since

0.1.0
