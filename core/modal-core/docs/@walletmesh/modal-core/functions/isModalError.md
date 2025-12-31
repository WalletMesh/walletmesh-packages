[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isModalError

# Function: isModalError()

> **isModalError**(`value`): value is \{ category: "user" \| "wallet" \| "network" \| "general" \| "validation" \| "sandbox"; cause?: unknown; classification?: "network" \| "permission" \| "provider" \| "temporary" \| "permanent" \| "unknown"; code: string; data?: Record\<string, unknown\>; maxRetries?: number; message: string; recoveryStrategy?: "retry" \| "wait\_and\_retry" \| "manual\_action" \| "none"; retryDelay?: number \}

Check if a value is a valid ModalError

Validates that an object conforms to the ModalError structure:
- code: Error code string for programmatic handling
- message: Human-readable error message
- category: Error category ('general', 'wallet', 'network', 'user')
- fatal: Optional boolean indicating if error is recoverable
- data: Optional additional error context

## Parameters

### value

`unknown`

The value to check

## Returns

value is \{ category: "user" \| "wallet" \| "network" \| "general" \| "validation" \| "sandbox"; cause?: unknown; classification?: "network" \| "permission" \| "provider" \| "temporary" \| "permanent" \| "unknown"; code: string; data?: Record\<string, unknown\>; maxRetries?: number; message: string; recoveryStrategy?: "retry" \| "wait\_and\_retry" \| "manual\_action" \| "none"; retryDelay?: number \}

True if value is a valid ModalError

## Example

```typescript
try {
  await wallet.connect();
} catch (error) {
  if (isModalError(error)) {
    // Handle structured error
    if (error.category === 'user') {
      console.log('User cancelled:', error.message);
    } else if (error.fatal) {
      console.error('Fatal error:', error.code);
    }
  } else {
    // Handle unexpected error
    console.error('Unknown error:', error);
  }
}
```
