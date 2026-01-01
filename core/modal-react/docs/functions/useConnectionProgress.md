[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useConnectionProgress

# Function: useConnectionProgress()

> **useConnectionProgress**(): `number`

Defined in: [core/modal-react/src/hooks/useConnect.ts:802](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L802)

Hook to get connection progress

Returns the current connection progress as a percentage (0-100).

## Returns

`number`

Connection progress percentage (0-100)

## Since

1.0.0

## Example

```tsx
function ConnectionProgress() {
  const progress = useConnectionProgress();
  const isConnecting = useIsConnecting();

  if (!isConnecting) return null;

  return (
    <div>
      <p>Connecting... {progress}%</p>
      <progress value={progress} max={100} />
    </div>
  );
}
```
