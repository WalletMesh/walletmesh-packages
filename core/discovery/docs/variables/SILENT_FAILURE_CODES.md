[**@walletmesh/discovery v0.1.4**](../README.md)

***

[@walletmesh/discovery](../globals.md) / SILENT\_FAILURE\_CODES

# Variable: SILENT\_FAILURE\_CODES

> `const` `readonly` **SILENT\_FAILURE\_CODES**: `Set`\<`2001` \| `2003` \| `2004` \| `3001` \| `3002`\>

Defined in: [core/discovery/src/core/constants.ts:616](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/core/constants.ts#L616)

Silent failure error codes for security and privacy protection.

Set of error codes that should result in no response being sent
to maintain security and privacy. These errors are logged locally
but not communicated to the requesting party to prevent information
leakage about wallet capabilities or security policies.

Silent failures are crucial for:
- Preventing capability enumeration attacks
- Hiding security policy details from potential attackers
- Maintaining user privacy about installed wallets

## Examples

```typescript
function handleDiscoveryError(error: DiscoveryError): void {
  // Log locally for debugging
  console.error('Discovery error:', error);

  // Check if error should be silent
  if (SILENT_FAILURE_CODES.has(error.code)) {
    // Do not send error response
    return;
  }

  // Send error response for non-silent failures
  sendErrorResponse(error);
}
```

```typescript
try {
  validateOrigin(request.origin);
} catch (error) {
  if (error.code === ERROR_CODES.ORIGIN_BLOCKED) {
    // Silent failure - don't reveal blocklist
    logger.warn('Blocked origin attempted connection', { origin: request.origin });
    return;
  }
  throw error;
}
```

## Since

0.1.0

## See

 - [ERROR\_CODES](ERROR_CODES.md) for error code definitions
 - [RETRYABLE\_ERROR\_CODES](RETRYABLE_ERROR_CODES.md) for transient errors
