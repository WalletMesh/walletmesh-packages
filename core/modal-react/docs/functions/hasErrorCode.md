[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / hasErrorCode

# Function: hasErrorCode()

> **hasErrorCode**(`error`): error is \{ code: string \| number \}

Defined in: core/modal-core/dist/api/types/guards.d.ts:177

Type guard to check if an error has a code property

Useful for handling errors from various sources that may or may not
have error codes. Supports both string and numeric error codes.

## Parameters

### error

`unknown`

The error to check

## Returns

error is \{ code: string \| number \}

True if error has a code property (string or number)

## Example

```typescript
catch (error) {
  if (hasErrorCode(error)) {
    // TypeScript knows error.code exists
    switch (error.code) {
      case 'USER_REJECTED':
      case 4001: // MetaMask user rejection code
        handleUserRejection();
        break;
      default:
        handleGenericError(error.code);
    }
  }
}
```
