[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useAutoDisconnectOnSessionError

# Function: useAutoDisconnectOnSessionError()

> **useAutoDisconnectOnSessionError**(`onSessionError`): [`UseSessionErrorReturn`](../interfaces/UseSessionErrorReturn.md)

Defined in: [core/modal-react/src/hooks/useSessionError.ts:307](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useSessionError.ts#L307)

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
