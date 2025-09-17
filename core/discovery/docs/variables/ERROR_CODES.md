[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ERROR\_CODES

# Variable: ERROR\_CODES

> `const` `readonly` **ERROR\_CODES**: `object`

Defined in: [core/discovery/src/core/constants.ts:438](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/core/constants.ts#L438)

Standardized numeric error codes for the discovery protocol.

Error codes follow a 4-digit numeric format with category-based ranges.
These codes ensure consistent error handling across implementations
while maintaining security and privacy principles.

## Type Declaration

### CAPABILITY\_NOT\_SUPPORTED

> `readonly` **CAPABILITY\_NOT\_SUPPORTED**: `3001` = `3001`

### CAPABILITY\_TEMPORARILY\_UNAVAILABLE

> `readonly` **CAPABILITY\_TEMPORARILY\_UNAVAILABLE**: `3005` = `3005`

### CHAIN\_NOT\_SUPPORTED

> `readonly` **CHAIN\_NOT\_SUPPORTED**: `3002` = `3002`

### CONNECTION\_ALREADY\_EXISTS

> `readonly` **CONNECTION\_ALREADY\_EXISTS**: `4004` = `4004`

### CONNECTION\_CLOSED

> `readonly` **CONNECTION\_CLOSED**: `4005` = `4005`

### CONNECTION\_REJECTED

> `readonly` **CONNECTION\_REJECTED**: `4002` = `4002`

### CONNECTION\_TIMEOUT

> `readonly` **CONNECTION\_TIMEOUT**: `4001` = `4001`

### DUPLICATE\_RESPONSE\_DETECTED

> `readonly` **DUPLICATE\_RESPONSE\_DETECTED**: `2008` = `2008`

### ENCODING\_ERROR

> `readonly` **ENCODING\_ERROR**: `1007` = `1007`

### EXTENSION\_NOT\_READY

> `readonly` **EXTENSION\_NOT\_READY**: `5005` = `5005`

### FEATURE\_NOT\_AVAILABLE

> `readonly` **FEATURE\_NOT\_AVAILABLE**: `3003` = `3003`

### HTTPS\_REQUIRED

> `readonly` **HTTPS\_REQUIRED**: `2005` = `2005`

### INCOMPATIBLE\_CAPABILITY\_VERSION

> `readonly` **INCOMPATIBLE\_CAPABILITY\_VERSION**: `3006` = `3006`

### INITIALIZATION\_ERROR

> `readonly` **INITIALIZATION\_ERROR**: `5004` = `5004`

### INTERFACE\_NOT\_IMPLEMENTED

> `readonly` **INTERFACE\_NOT\_IMPLEMENTED**: `3004` = `3004`

### INTERNAL\_WALLET\_ERROR

> `readonly` **INTERNAL\_WALLET\_ERROR**: `5001` = `5001`

### INVALID\_MESSAGE\_FORMAT

> `readonly` **INVALID\_MESSAGE\_FORMAT**: `1001` = `1001`

### INVALID\_SESSION\_ID

> `readonly` **INVALID\_SESSION\_ID**: `1004` = `1004`

### INVALID\_TIMESTAMP

> `readonly` **INVALID\_TIMESTAMP**: `1006` = `1006`

### MAX\_CONNECTIONS\_REACHED

> `readonly` **MAX\_CONNECTIONS\_REACHED**: `4006` = `4006`

### MESSAGE\_TOO\_LARGE

> `readonly` **MESSAGE\_TOO\_LARGE**: `1005` = `1005`

### MISSING\_REQUIRED\_FIELD

> `readonly` **MISSING\_REQUIRED\_FIELD**: `1003` = `1003`

### ORIGIN\_BLOCKED

> `readonly` **ORIGIN\_BLOCKED**: `2004` = `2004`

### ORIGIN\_VALIDATION\_FAILED

> `readonly` **ORIGIN\_VALIDATION\_FAILED**: `2001` = `2001`

### RATE\_LIMIT\_EXCEEDED

> `readonly` **RATE\_LIMIT\_EXCEEDED**: `2002` = `2002`

### RESOURCE\_EXHAUSTED

> `readonly` **RESOURCE\_EXHAUSTED**: `5002` = `5002`

### SESSION\_REPLAY\_DETECTED

> `readonly` **SESSION\_REPLAY\_DETECTED**: `2003` = `2003`

### SIGNATURE\_VERIFICATION\_FAILED

> `readonly` **SIGNATURE\_VERIFICATION\_FAILED**: `2006` = `2006`

### STORAGE\_ERROR

> `readonly` **STORAGE\_ERROR**: `5003` = `5003`

### UNAUTHORIZED\_ACCESS

> `readonly` **UNAUTHORIZED\_ACCESS**: `2007` = `2007`

### UNSUPPORTED\_VERSION

> `readonly` **UNSUPPORTED\_VERSION**: `1002` = `1002`

### WALLET\_NOT\_FOUND

> `readonly` **WALLET\_NOT\_FOUND**: `4003` = `4003`

## Example

```typescript
// Check for specific error
if (error.code === ERROR_CODES.ORIGIN_VALIDATION_FAILED) {
  console.log('Origin validation failed');
}

// Check error category
if (error.code >= 2000 && error.code < 3000) {
  console.log('Security error occurred');
}

// Error response
const errorResponse = {
  type: 'wallet:discovery:error',
  error: {
    code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    message: 'Rate limit exceeded',
    category: 'security'
  }
};
```

## Since

0.1.0

## See

 - [DiscoveryErrorEvent](../interfaces/DiscoveryErrorEvent.md) for error event structure
 - [DiscoveryError](../interfaces/DiscoveryError.md) for error handling
