[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / deserializeState

# Variable: deserializeState()

> `const` **deserializeState**: (`serialized`) => `HeadlessModalState` = `ssrState.deserialize`

Defined in: [core/modal-react/src/utils/ssr-walletmesh.ts:233](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/utils/ssr-walletmesh.ts#L233)

Deserialize WalletMesh state from SSR hydration

Reconstructs the WalletMesh state from its serialized format. This function
is used on the client-side to restore state that was rendered on the server,
preventing hydration mismatches.

Key features:
- Restores wallet connection information
- Reconstructs session state
- Maintains view and UI state
- Ensures type safety
- Handles missing or malformed data gracefully

## Parameters

### serialized

`string`

The serialized state from the server

## Returns

`HeadlessModalState`

The reconstructed WalletMesh state

## Examples

```typescript
// On the client (React component)
function MyApp({ walletMeshState }) {
  const [state, setState] = useState(() =>
    deserializeState(walletMeshState)
  );

  return (
    <WalletMeshProvider initialState={state}>
      <App />
    </WalletMeshProvider>
  );
}
```

```typescript
// Next.js client component with SSR
'use client';

export function ClientWallet({ initialState }: { initialState: string }) {
  const hydrated = useMemo(() => {
    return deserializeState(initialState);
  }, [initialState]);

  return (
    <WalletMeshProvider initialState={hydrated}>
      <ConnectButton />
    </WalletMeshProvider>
  );
}
```
