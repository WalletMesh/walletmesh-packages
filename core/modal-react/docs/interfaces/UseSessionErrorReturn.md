[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseSessionErrorReturn

# Interface: UseSessionErrorReturn

Defined in: [core/modal-react/src/hooks/useSessionError.ts:84](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useSessionError.ts#L84)

Return type for the useSessionError hook

## Other

### clearSessionError()

> **clearSessionError**: () => `void`

Defined in: [core/modal-react/src/hooks/useSessionError.ts:93](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useSessionError.ts#L93)

Manually clear the session error from the store

#### Returns

`void`

***

### sessionError

> **sessionError**: `null` \| [`SessionError`](SessionError.md)

Defined in: [core/modal-react/src/hooks/useSessionError.ts:88](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useSessionError.ts#L88)

Current session error, if any

## Utilities

### isSessionError()

> **isSessionError**: (`error`) => `boolean`

Defined in: [core/modal-react/src/hooks/useSessionError.ts:99](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useSessionError.ts#L99)

Check if any error is a session-related error
This is a re-export of the utility function for convenience

Check if an error is a session-related error

Detects errors related to invalid, expired, or terminated wallet sessions.
Checks for the standard JSON-RPC error code (-32001) and common session
error message patterns.

#### Parameters

##### error

`unknown`

The error to check (can be any type)

#### Returns

`boolean`

True if the error is session-related, false otherwise

#### Example

```typescript
try {
  await provider.call('eth_accounts');
} catch (error) {
  if (isSessionError(error)) {
    console.log('Session expired, need to reconnect');
    await disconnect();
  }
}
```

#### Since

3.0.0
