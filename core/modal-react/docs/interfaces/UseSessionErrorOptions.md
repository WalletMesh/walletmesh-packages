[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseSessionErrorOptions

# Interface: UseSessionErrorOptions

Defined in: [core/modal-react/src/hooks/useSessionError.ts:50](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useSessionError.ts#L50)

Options for the useSessionError hook

## Properties

### autoDisconnect?

> `optional` **autoDisconnect**: `boolean`

Defined in: [core/modal-react/src/hooks/useSessionError.ts:55](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useSessionError.ts#L55)

Whether to automatically disconnect when a session error is detected

#### Default

```ts
true
```

***

### disconnectReason?

> `optional` **disconnectReason**: `string`

Defined in: [core/modal-react/src/hooks/useSessionError.ts:76](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useSessionError.ts#L76)

Custom disconnect reason to use when auto-disconnecting

#### Default

```ts
'session_expired'
```

***

### onSessionError()?

> `optional` **onSessionError**: (`error`) => `void`

Defined in: [core/modal-react/src/hooks/useSessionError.ts:70](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useSessionError.ts#L70)

Callback invoked when a session error is detected
Use this to show notifications/toasts to the user

#### Parameters

##### error

[`SessionError`](SessionError.md)

#### Returns

`void`

#### Example

```typescript
const { sessionError } = useSessionError({
  onSessionError: (error) => {
    toast.error(`Session expired (${error.code}). Please reconnect.`);
  }
});
```
