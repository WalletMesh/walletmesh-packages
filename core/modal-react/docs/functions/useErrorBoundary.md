[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useErrorBoundary

# Function: useErrorBoundary()

> **useErrorBoundary**(): `object`

Defined in: [core/modal-react/src/components/WalletMeshErrorBoundary.tsx:574](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshErrorBoundary.tsx#L574)

Hook to programmatically capture and handle errors in functional components

Provides imperative API for error boundary functionality in hooks.
Note: This creates a local error state, not connected to parent error boundaries.

## Use Cases
- Capture async errors that error boundaries can't catch
- Programmatically trigger error states
- Reset error states from within components
- Handle errors in event handlers and effects

## Returns

`object`

Object with error control functions

### captureError()

> **captureError**: (`error`) => `void`

#### Parameters

##### error

`Error`

#### Returns

`void`

### resetErrorBoundary()

> **resetErrorBoundary**: () => `void`

#### Returns

`void`

## Examples

```tsx
function RiskyComponent() {
  const { captureError, resetErrorBoundary } = useErrorBoundary();

  const handleRiskyOperation = async () => {
    try {
      await riskyAsyncOperation();
    } catch (error) {
      // This will trigger the nearest error boundary
      captureError(error);
    }
  };

  return (
    <div>
      <button onClick={handleRiskyOperation}>
        Perform Risky Operation
      </button>
      <button onClick={resetErrorBoundary}>
        Reset Errors
      </button>
    </div>
  );
}
```

```tsx
// Handling errors in useEffect
function DataLoader({ userId }: { userId: string }) {
  const { captureError } = useErrorBoundary();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchUserData(userId)
      .then(setData)
      .catch(captureError); // Errors will trigger error boundary
  }, [userId, captureError]);

  return <div>{data && <UserProfile data={data} />}</div>;
}
```

## Since

1.0.0
