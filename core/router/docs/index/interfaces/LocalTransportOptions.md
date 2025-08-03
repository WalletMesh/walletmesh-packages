[**@walletmesh/router v0.5.2**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / LocalTransportOptions

# Interface: LocalTransportOptions

Defined in: [core/router/src/localTransport.ts:23](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/localTransport.ts#L23)

Configuration options for LocalTransport

## Example

```typescript
// Default behavior - errors are logged as warnings
const transport = new LocalTransport();

// Throw errors instead of logging
const strictTransport = new LocalTransport({ throwOnError: true });
```

## Properties

### throwOnError?

> `optional` **throwOnError**: `boolean`

Defined in: [core/router/src/localTransport.ts:37](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/localTransport.ts#L37)

Whether to throw errors instead of logging warnings.
When true, errors in message handling will be thrown.
When false (default), errors will be logged as warnings.

Use cases:
- Set to `true` in test environments for immediate error feedback
- Set to `true` when you need strict error handling and want failures to propagate
- Leave as `false` (default) in production for resilient operation where
  transient errors shouldn't crash the transport

#### Default Value

```ts
false
```
