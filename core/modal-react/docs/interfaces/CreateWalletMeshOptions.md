[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / CreateWalletMeshOptions

# Interface: CreateWalletMeshOptions

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:327

Configuration options for the createWalletMesh factory function.

These options control how the client is created and initialized,
allowing customization of environment detection and debugging.

## Example

```typescript
// Force SSR mode for testing
const client = createWalletMesh(config, {
  ssr: true
});

// Enable debug logging
const client = createWalletMesh(config, {
  debug: true
});
```

## Since

1.0.0

## Properties

### debug?

> `optional` **debug**: `boolean`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:351

Enable additional debug logging.

When true, the client will output detailed logs for:
- Connection attempts and results
- State transitions
- Service initialization
- Error details

#### Default

```ts
false
```

***

### ssr?

> `optional` **ssr**: `boolean`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:339

Force SSR mode regardless of environment detection.

When true, returns a no-op client safe for server-side rendering.
Useful for:
- Testing SSR behavior
- Forcing SSR in ambiguous environments
- Ensuring consistent behavior across environments

#### Default

```ts
Automatically detected using isServer()
```
