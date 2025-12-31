[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useAutoDisconnectOnSessionError

# Function: useAutoDisconnectOnSessionError()

> **useAutoDisconnectOnSessionError**(`onSessionError`): [`UseSessionErrorReturn`](../interfaces/UseSessionErrorReturn.md)

Defined in: [core/modal-react/src/hooks/useSessionError.ts:307](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useSessionError.ts#L307)

Simplified hook for automatic session error handling with minimal configuration

Provides a convenience wrapper around useSessionError with common defaults.
Automatically disconnects on session errors and calls the provided callback.

## Parameters

### onSessionError

(`error`) => `void`

Callback to invoke when a session error is detected

## Returns

[`UseSessionErrorReturn`](../interfaces/UseSessionErrorReturn.md)

Session error state and utilities

## Example

```typescript
function MyComponent() {
  useAutoDisconnectOnSessionError((error) => {
    toast.error(`Session expired: ${error.message}`);
  });

  // Component will automatically disconnect and show notification
}
```

## Since

3.0.0
