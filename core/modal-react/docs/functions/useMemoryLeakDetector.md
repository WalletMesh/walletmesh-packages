[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useMemoryLeakDetector

# Function: useMemoryLeakDetector()

> **useMemoryLeakDetector**(`componentName`): `object`

Defined in: [core/modal-react/src/utils/performance.ts:235](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/utils/performance.ts#L235)

Hook to detect and warn about memory leaks
Tracks if state updates happen after component unmount

## Parameters

### componentName

`string`

Name of the component

## Returns

`object`

Object with isMounted flag and safeSetState wrapper

### isMounted

> **isMounted**: `boolean` = `isMounted.current`

### safeSetState()

> **safeSetState**: (`setter`) => `void`

#### Parameters

##### setter

() => `void`

#### Returns

`void`

## Example

```tsx
function MyComponent() {
  const { isMounted, safeSetState } = useMemoryLeakDetector('MyComponent');
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then((result) => {
      safeSetState(() => setData(result));
    });
  }, []);
}
```
