[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useConnectionProgress

# Function: useConnectionProgress()

> **useConnectionProgress**(): `number`

Defined in: [core/modal-react/src/hooks/useConnect.ts:802](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useConnect.ts#L802)

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
