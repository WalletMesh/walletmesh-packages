[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useConnectionProgress

# Function: useConnectionProgress()

> **useConnectionProgress**(): `number`

Defined in: [core/modal-react/src/hooks/useConnect.ts:778](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L778)

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
