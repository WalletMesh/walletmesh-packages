[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / performanceHooks

# Variable: performanceHooks

> `const` **performanceHooks**: `object`

Defined in: [core/modal-react/src/utils/performance.ts:329](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/utils/performance.ts#L329)

## Type Declaration

### useBatchedUpdates()

> **useBatchedUpdates**: (`callback`) => () => `void`

Hook to batch multiple state updates
Helps reduce re-renders by batching updates together

#### Parameters

##### callback

() => `void`

Function containing state updates

#### Returns

Function to trigger batched updates

> (): `void`

##### Returns

`void`

#### Example

```tsx
function MyComponent() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);

  const batchUpdate = useBatchedUpdates(() => {
    setA(1);
    setB(2);
    // Both updates will cause only one re-render
  });
}
```

### useLifecycleProfiler()

> **useLifecycleProfiler**: (`componentName`) => `void`

Hook to profile component lifecycle
Tracks mount, update, and unmount with timing information

#### Parameters

##### componentName

`string`

Name of the component

#### Returns

`void`

#### Example

```tsx
function MyComponent() {
  useLifecycleProfiler('MyComponent');
  // Will log mount time, update count, and unmount
}
```

### useMemoryLeakDetector()

> **useMemoryLeakDetector**: (`componentName`) => `object`

Hook to detect and warn about memory leaks
Tracks if state updates happen after component unmount

#### Parameters

##### componentName

`string`

Name of the component

#### Returns

`object`

Object with isMounted flag and safeSetState wrapper

##### isMounted

> **isMounted**: `boolean` = `isMounted.current`

##### safeSetState()

> **safeSetState**: (`setter`) => `void`

###### Parameters

###### setter

() => `void`

###### Returns

`void`

#### Example

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

### useRenderCount()

> **useRenderCount**: (`componentName`, `logThreshold`) => `number`

Hook to track component render count
Useful for identifying components that re-render too frequently

#### Parameters

##### componentName

`string`

Name of the component for logging

##### logThreshold

`number` = `Number.POSITIVE_INFINITY`

Only log when render count exceeds this threshold

#### Returns

`number`

Current render count

#### Example

```tsx
function MyComponent() {
  const renderCount = useRenderCount('MyComponent', 10);
  // Component will log a warning if it renders more than 10 times
  return <div>Render #{renderCount}</div>;
}
```

### useRenderTime()

> **useRenderTime**: (`componentName`, `warnThreshold`) => `number`

Hook to measure render time
Tracks how long each render takes and warns about slow renders

#### Parameters

##### componentName

`string`

Name of the component

##### warnThreshold

`number` = `16`

Warn if render takes longer than this (ms)

#### Returns

`number`

Render time in milliseconds

#### Example

```tsx
function ExpensiveComponent() {
  const renderTime = useRenderTime('ExpensiveComponent', 16); // Warn if > 16ms
  return <ComplexVisualization />;
}
```

### useValueTracker()

> **useValueTracker**: \<`T`\>(`label`, `value`, `logChanges`) => `void`

Hook to track updates to a specific value
Useful for debugging when a value changes unexpectedly

#### Type Parameters

##### T

`T`

#### Parameters

##### label

`string`

Label for the value being tracked

##### value

`T`

The value to track

##### logChanges

`boolean` = `true`

Whether to log changes

#### Returns

`void`

#### Example

```tsx
function MyComponent({ userId }) {
  useValueTracker('userId', userId);
  // Will log whenever userId changes
}
```

### useWhyDidYouUpdate()

> **useWhyDidYouUpdate**: \<`T`\>(`name`, `props`) => `void`

Hook to track why a component re-rendered
Compares current props with previous props to identify changes

#### Type Parameters

##### T

`T` *extends* `Record`\<`string`, `unknown`\>

#### Parameters

##### name

`string`

Component name for logging

##### props

`T`

Current props to track

#### Returns

`void`

#### Example

```tsx
function MyComponent({ user, settings, onUpdate }) {
  useWhyDidYouUpdate('MyComponent', { user, settings, onUpdate });
  // Will log which props changed between renders
  return <div>{user.name}</div>;
}
```
