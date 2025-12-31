[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshErrorBoundary

# Class: WalletMeshErrorBoundary

Defined in: [core/modal-react/src/components/WalletMeshErrorBoundary.tsx:151](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/components/WalletMeshErrorBoundary.tsx#L151)

Error boundary component for WalletMesh applications

Catches JavaScript errors anywhere in the child component tree, logs those errors,
and displays a fallback UI instead of the component tree that crashed.
This component extends React's Component class and implements error boundary functionality.

## Error Handling Patterns

The error boundary handles various types of errors:
- **Wallet Connection Errors**: Specific handling for wallet-related failures
- **Network Errors**: Connection timeouts and network failures
- **Runtime Errors**: JavaScript exceptions in child components
- **Async Errors**: Unhandled promise rejections (with useErrorBoundary hook)

## Recovery Strategies

Automatic recovery actions based on error type:
- **Retry**: Re-render the component tree
- **Refresh**: Reload the entire application
- **Custom Actions**: Developer-defined recovery functions

## Logging and Debugging

In development mode:
- Full stack traces are displayed
- Component stack is included
- Error objects are fully serialized

In production mode:
- User-friendly messages are shown
- Sensitive information is hidden
- Errors can be sent to monitoring services

## Examples

```tsx
// Basic usage with default fallback UI
<WalletMeshErrorBoundary>
  <WalletMeshProvider config={config}>
    <App />
  </WalletMeshProvider>
</WalletMeshErrorBoundary>
```

```tsx
// Custom fallback UI with error details
<WalletMeshErrorBoundary
  fallback={(props) => (
    <div className="error-page">
      <h1>Oops! Something went wrong</h1>
      <p>{props.error?.message || 'Unknown error'}</p>
      <button onClick={props.resetError}>
        Try Again
      </button>
    </div>
  )}
  onError={(error, info) => {
    // Send to error monitoring service
    errorReporter.log(error, info);
  }}
>
  <App />
</WalletMeshErrorBoundary>
```

```tsx
// Production setup with monitoring
<WalletMeshErrorBoundary
  enableLogging={process.env['NODE_ENV'] === 'development'}
  logPrefix="[MyDApp]"
  onError={(error, errorInfo) => {
    // Log to Sentry, LogRocket, etc.
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    });
  }}
  fallback={<ErrorFallback />}
>
  <WalletMeshProvider config={config}>
    <Router>
      <App />
    </Router>
  </WalletMeshProvider>
</WalletMeshErrorBoundary>
```

```tsx
// Nested error boundaries for granular error handling
<WalletMeshErrorBoundary fallback={<AppErrorFallback />}>
  <WalletMeshProvider config={config}>
    <Header />
    <WalletMeshErrorBoundary fallback={<WalletErrorFallback />}>
      <WalletSection />
    </WalletMeshErrorBoundary>
    <MainContent />
  </WalletMeshProvider>
</WalletMeshErrorBoundary>
```

## Since

1.0.0

## Extends

- `Component`\<[`ErrorBoundaryProps`](../interfaces/ErrorBoundaryProps.md), [`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md)\>

## Constructors

### Constructor

> **new WalletMeshErrorBoundary**(`props`): `WalletMeshErrorBoundary`

Defined in: [core/modal-react/src/components/WalletMeshErrorBoundary.tsx:154](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/components/WalletMeshErrorBoundary.tsx#L154)

#### Parameters

##### props

[`ErrorBoundaryProps`](../interfaces/ErrorBoundaryProps.md)

#### Returns

`WalletMeshErrorBoundary`

#### Overrides

`Component<ErrorBoundaryProps, ErrorBoundaryState>.constructor`

## Properties

### context

> **context**: `unknown`

Defined in: node\_modules/.pnpm/@types+react@19.1.15/node\_modules/@types/react/index.d.ts:946

If using React Context, re-declare this in your class to be the
`React.ContextType` of your `static contextType`.
Should be used with type annotation or static contextType.

#### Example

```ts
static contextType = MyContext
// For TS pre-3.7:
context!: React.ContextType<typeof MyContext>
// For TS 3.7 and above:
declare context: React.ContextType<typeof MyContext>
```

#### See

[React Docs](https://react.dev/reference/react/Component#context)

#### Inherited from

`Component.context`

***

### props

> `readonly` **props**: `Readonly`\<`P`\>

Defined in: node\_modules/.pnpm/@types+react@19.1.15/node\_modules/@types/react/index.d.ts:970

#### Inherited from

`Component.props`

***

### state

> **state**: `Readonly`\<`S`\>

Defined in: node\_modules/.pnpm/@types+react@19.1.15/node\_modules/@types/react/index.d.ts:971

#### Inherited from

`Component.state`

***

### contextType?

> `static` `optional` **contextType**: `Context`\<`any`\>

Defined in: node\_modules/.pnpm/@types+react@19.1.15/node\_modules/@types/react/index.d.ts:922

If set, `this.context` will be set at runtime to the current value of the given Context.

#### Example

```ts
type MyContext = number
const Ctx = React.createContext<MyContext>(0)

class Foo extends React.Component {
  static contextType = Ctx
  context!: React.ContextType<typeof Ctx>
  render () {
    return <>My context's value: {this.context}</>;
  }
}
```

#### See

[https://react.dev/reference/react/Component#static-contexttype](https://react.dev/reference/react/Component#static-contexttype)

#### Inherited from

`Component.contextType`

***

### ~~propTypes?~~

> `static` `optional` **propTypes**: `any`

Defined in: node\_modules/.pnpm/@types+react@19.1.15/node\_modules/@types/react/index.d.ts:928

Ignored by React.

#### Deprecated

Only kept in types for backwards compatibility. Will be removed in a future major release.

#### Inherited from

`Component.propTypes`

## Methods

### componentDidCatch()

> **componentDidCatch**(`error`, `errorInfo`): `void`

Defined in: [core/modal-react/src/components/WalletMeshErrorBoundary.tsx:195](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/components/WalletMeshErrorBoundary.tsx#L195)

Lifecycle method called after an error has been thrown by a descendant component

This method is called during the "commit" phase, so side effects are permitted.
It's used for error logging and can trigger error reporting to external services.

#### Parameters

##### error

`unknown`

The error that was thrown, can be any type (not just Error instances)

##### errorInfo

`ErrorInfo`

Object containing the component stack trace showing where the error occurred

#### Returns

`void`

#### Overrides

`Component.componentDidCatch`

***

### componentDidMount()?

> `optional` **componentDidMount**(): `void`

Defined in: node\_modules/.pnpm/@types+react@19.1.15/node\_modules/@types/react/index.d.ts:1189

Called immediately after a component is mounted. Setting state here will trigger re-rendering.

#### Returns

`void`

#### Inherited from

`Component.componentDidMount`

***

### componentDidUpdate()?

> `optional` **componentDidUpdate**(`prevProps`, `prevState`, `snapshot?`): `void`

Defined in: node\_modules/.pnpm/@types+react@19.1.15/node\_modules/@types/react/index.d.ts:1252

Called immediately after updating occurs. Not called for the initial render.

The snapshot is only present if [getSnapshotBeforeUpdate](#getsnapshotbeforeupdate) is present and returns non-null.

#### Parameters

##### prevProps

`Readonly`\<`P`\>

##### prevState

`Readonly`\<`S`\>

##### snapshot?

`any`

#### Returns

`void`

#### Inherited from

`Component.componentDidUpdate`

***

### ~~componentWillMount()?~~

> `optional` **componentWillMount**(): `void`

Defined in: node\_modules/.pnpm/@types+react@19.1.15/node\_modules/@types/react/index.d.ts:1268

Called immediately before mounting occurs, and before Component.render.
Avoid introducing any side-effects or subscriptions in this method.

Note: the presence of NewLifecycle.getSnapshotBeforeUpdate getSnapshotBeforeUpdate
or StaticLifecycle.getDerivedStateFromProps getDerivedStateFromProps prevents
this from being invoked.

#### Returns

`void`

#### Deprecated

16.3, use ComponentLifecycle.componentDidMount componentDidMount or the constructor instead; will stop working in React 17

#### See

 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state)
 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path)

#### Inherited from

`Component.componentWillMount`

***

### ~~componentWillReceiveProps()?~~

> `optional` **componentWillReceiveProps**(`nextProps`, `nextContext`): `void`

Defined in: node\_modules/.pnpm/@types+react@19.1.15/node\_modules/@types/react/index.d.ts:1299

Called when the component may be receiving new props.
React may call this even if props have not changed, so be sure to compare new and existing
props if you only want to handle changes.

Calling Component.setState generally does not trigger this method.

Note: the presence of NewLifecycle.getSnapshotBeforeUpdate getSnapshotBeforeUpdate
or StaticLifecycle.getDerivedStateFromProps getDerivedStateFromProps prevents
this from being invoked.

#### Parameters

##### nextProps

`Readonly`\<`P`\>

##### nextContext

`any`

#### Returns

`void`

#### Deprecated

16.3, use static StaticLifecycle.getDerivedStateFromProps getDerivedStateFromProps instead; will stop working in React 17

#### See

 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props)
 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path)

#### Inherited from

`Component.componentWillReceiveProps`

***

### componentWillUnmount()?

> `optional` **componentWillUnmount**(): `void`

Defined in: node\_modules/.pnpm/@types+react@19.1.15/node\_modules/@types/react/index.d.ts:1205

Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
cancelled network requests, or cleaning up any DOM elements created in `componentDidMount`.

#### Returns

`void`

#### Inherited from

`Component.componentWillUnmount`

***

### ~~componentWillUpdate()?~~

> `optional` **componentWillUpdate**(`nextProps`, `nextState`, `nextContext`): `void`

Defined in: node\_modules/.pnpm/@types+react@19.1.15/node\_modules/@types/react/index.d.ts:1331

Called immediately before rendering when new props or state is received. Not called for the initial render.

Note: You cannot call Component.setState here.

Note: the presence of NewLifecycle.getSnapshotBeforeUpdate getSnapshotBeforeUpdate
or StaticLifecycle.getDerivedStateFromProps getDerivedStateFromProps prevents
this from being invoked.

#### Parameters

##### nextProps

`Readonly`\<`P`\>

##### nextState

`Readonly`\<`S`\>

##### nextContext

`any`

#### Returns

`void`

#### Deprecated

16.3, use getSnapshotBeforeUpdate instead; will stop working in React 17

#### See

 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update)
 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path)

#### Inherited from

`Component.componentWillUpdate`

***

### forceUpdate()

> **forceUpdate**(`callback?`): `void`

Defined in: node\_modules/.pnpm/@types+react@19.1.15/node\_modules/@types/react/index.d.ts:967

#### Parameters

##### callback?

() => `void`

#### Returns

`void`

#### Inherited from

`Component.forceUpdate`

***

### getSnapshotBeforeUpdate()?

> `optional` **getSnapshotBeforeUpdate**(`prevProps`, `prevState`): `any`

Defined in: node\_modules/.pnpm/@types+react@19.1.15/node\_modules/@types/react/index.d.ts:1246

Runs before React applies the result of Component.render render to the document, and
returns an object to be given to [componentDidUpdate](#componentdidupdate). Useful for saving
things such as scroll position before Component.render render causes changes to it.

Note: the presence of this method prevents any of the deprecated
lifecycle events from running.

#### Parameters

##### prevProps

`Readonly`\<`P`\>

##### prevState

`Readonly`\<`S`\>

#### Returns

`any`

#### Inherited from

`Component.getSnapshotBeforeUpdate`

***

### render()

> **render**(): `ReactNode`

Defined in: [core/modal-react/src/components/WalletMeshErrorBoundary.tsx:482](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/components/WalletMeshErrorBoundary.tsx#L482)

Renders the component

#### Returns

`ReactNode`

Either the fallback UI if an error occurred, or the children

#### Overrides

`Component.render`

***

### resetErrorBoundary()

> **resetErrorBoundary**(): `void`

Defined in: [core/modal-react/src/components/WalletMeshErrorBoundary.tsx:279](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/components/WalletMeshErrorBoundary.tsx#L279)

Reset the error boundary state to clear the error and re-render children

This method can be called to programmatically recover from an error state.
It's typically triggered by user actions like clicking a "Try Again" button.

#### Returns

`void`

***

### setState()

> **setState**\<`K`\>(`state`, `callback?`): `void`

Defined in: node\_modules/.pnpm/@types+react@19.1.15/node\_modules/@types/react/index.d.ts:962

#### Type Parameters

##### K

`K` *extends* keyof [`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md)

#### Parameters

##### state

`null` | [`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md) | (`prevState`, `props`) => `null` \| [`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md) \| `Pick`\<[`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md), `K`\> | `Pick`\<[`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md), `K`\>

##### callback?

() => `void`

#### Returns

`void`

#### Inherited from

`Component.setState`

***

### shouldComponentUpdate()?

> `optional` **shouldComponentUpdate**(`nextProps`, `nextState`, `nextContext`): `boolean`

Defined in: node\_modules/.pnpm/@types+react@19.1.15/node\_modules/@types/react/index.d.ts:1200

Called to determine whether the change in props and state should trigger a re-render.

`Component` always returns true.
`PureComponent` implements a shallow comparison on props and state and returns true if any
props or states have changed.

If false is returned, Component.render, `componentWillUpdate`
and `componentDidUpdate` will not be called.

#### Parameters

##### nextProps

`Readonly`\<`P`\>

##### nextState

`Readonly`\<`S`\>

##### nextContext

`any`

#### Returns

`boolean`

#### Inherited from

`Component.shouldComponentUpdate`

***

### ~~UNSAFE\_componentWillMount()?~~

> `optional` **UNSAFE\_componentWillMount**(): `void`

Defined in: node\_modules/.pnpm/@types+react@19.1.15/node\_modules/@types/react/index.d.ts:1283

Called immediately before mounting occurs, and before Component.render.
Avoid introducing any side-effects or subscriptions in this method.

This method will not stop working in React 17.

Note: the presence of NewLifecycle.getSnapshotBeforeUpdate getSnapshotBeforeUpdate
or StaticLifecycle.getDerivedStateFromProps getDerivedStateFromProps prevents
this from being invoked.

#### Returns

`void`

#### Deprecated

16.3, use ComponentLifecycle.componentDidMount componentDidMount or the constructor instead

#### See

 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state)
 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path)

#### Inherited from

`Component.UNSAFE_componentWillMount`

***

### ~~UNSAFE\_componentWillReceiveProps()?~~

> `optional` **UNSAFE\_componentWillReceiveProps**(`nextProps`, `nextContext`): `void`

Defined in: node\_modules/.pnpm/@types+react@19.1.15/node\_modules/@types/react/index.d.ts:1317

Called when the component may be receiving new props.
React may call this even if props have not changed, so be sure to compare new and existing
props if you only want to handle changes.

Calling Component.setState generally does not trigger this method.

This method will not stop working in React 17.

Note: the presence of NewLifecycle.getSnapshotBeforeUpdate getSnapshotBeforeUpdate
or StaticLifecycle.getDerivedStateFromProps getDerivedStateFromProps prevents
this from being invoked.

#### Parameters

##### nextProps

`Readonly`\<`P`\>

##### nextContext

`any`

#### Returns

`void`

#### Deprecated

16.3, use static StaticLifecycle.getDerivedStateFromProps getDerivedStateFromProps instead

#### See

 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props)
 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path)

#### Inherited from

`Component.UNSAFE_componentWillReceiveProps`

***

### ~~UNSAFE\_componentWillUpdate()?~~

> `optional` **UNSAFE\_componentWillUpdate**(`nextProps`, `nextState`, `nextContext`): `void`

Defined in: node\_modules/.pnpm/@types+react@19.1.15/node\_modules/@types/react/index.d.ts:1347

Called immediately before rendering when new props or state is received. Not called for the initial render.

Note: You cannot call Component.setState here.

This method will not stop working in React 17.

Note: the presence of NewLifecycle.getSnapshotBeforeUpdate getSnapshotBeforeUpdate
or StaticLifecycle.getDerivedStateFromProps getDerivedStateFromProps prevents
this from being invoked.

#### Parameters

##### nextProps

`Readonly`\<`P`\>

##### nextState

`Readonly`\<`S`\>

##### nextContext

`any`

#### Returns

`void`

#### Deprecated

16.3, use getSnapshotBeforeUpdate instead

#### See

 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update)
 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path)

#### Inherited from

`Component.UNSAFE_componentWillUpdate`

***

### getDerivedStateFromError()

> `static` **getDerivedStateFromError**(`error`): `Partial`\<[`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md)\>

Defined in: [core/modal-react/src/components/WalletMeshErrorBoundary.tsx:176](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/components/WalletMeshErrorBoundary.tsx#L176)

Static lifecycle method called when an error is thrown in a descendant component

This method is called during the "render" phase, so side effects are not permitted.
It should be used to update state to display an error UI on the next render.

#### Parameters

##### error

`unknown`

The error that was thrown by a descendant component

#### Returns

`Partial`\<[`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md)\>

Updated state to trigger error UI rendering
