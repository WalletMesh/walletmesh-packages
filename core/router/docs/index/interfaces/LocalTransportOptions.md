[**@walletmesh/router v0.5.4**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / LocalTransportOptions

# Interface: LocalTransportOptions

Defined in: [core/router/src/localTransport.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/localTransport.ts#L24)

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

Defined in: [core/router/src/localTransport.ts:38](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/localTransport.ts#L38)

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
