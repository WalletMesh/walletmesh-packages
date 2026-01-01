[**@walletmesh/modal-core v0.0.4**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / SessionValidationResult

# Interface: SessionValidationResult

Session validation result

## Remarks

Contains the result of session validation including validity status,
failure reasons, and updated session information if activity tracking is enabled.

## Example

```typescript
const result = sessionManager.validateSession(sessionId, origin);
if (!result.valid) {
  console.error(`Session invalid: ${result.reason}`);
}
```

## Properties

### reason?

> `optional` **reason**: `"not_found"` \| `"revoked"` \| `"expired"` \| `"origin_mismatch"`

Reason if invalid

***

### session?

> `optional` **session**: [`SecureSession`](../../../../@walletmesh/modal-core/interfaces/SecureSession.md)

Updated session (if activity tracking is enabled)

***

### valid

> **valid**: `boolean`

Whether the session is valid
