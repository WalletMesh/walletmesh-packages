[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useSessionError

# Function: useSessionError()

> **useSessionError**(`options`): [`UseSessionErrorReturn`](../interfaces/UseSessionErrorReturn.md)

Defined in: [core/modal-react/src/hooks/useSessionError.ts:168](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useSessionError.ts#L168)

Hook for detecting and handling session errors

Automatically detects when a wallet session has expired or been terminated,
with optional auto-disconnect and notification callbacks. Handles deduplication
to prevent showing the same error multiple times.

## Parameters

### options

[`UseSessionErrorOptions`](../interfaces/UseSessionErrorOptions.md) = `{}`

Configuration options for session error handling

## Returns

[`UseSessionErrorReturn`](../interfaces/UseSessionErrorReturn.md)

Session error state and utilities

## Examples

```typescript
// Basic usage with auto-disconnect
function MyComponent() {
  const { sessionError } = useSessionError({
    onSessionError: (error) => {
      showToast(`Session expired: ${error.message}`);
    }
  });

  return <div>{sessionError ? 'Disconnected' : 'Connected'}</div>;
}
```

```typescript
// Usage without auto-disconnect
function MyComponent() {
  const { sessionError, clearSessionError } = useSessionError({
    autoDisconnect: false,
    onSessionError: (error) => {
      if (confirm('Session expired. Reconnect?')) {
        reconnect();
      }
      clearSessionError();
    }
  });
}
```

```typescript
// Check for session errors in operation handlers
function MyComponent() {
  const { isSessionError } = useSessionError();
  const { sendTransaction } = useTransaction();

  const handleSend = async () => {
    try {
      await sendTransaction({ ... });
    } catch (error) {
      if (isSessionError(error)) {
        // Handle session error specifically
        showToast('Session expired, please reconnect');
      } else {
        // Handle other errors
        showToast(`Transaction failed: ${error.message}`);
      }
    }
  };
}
```

## Since

3.0.0
