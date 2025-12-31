[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / createSSRWalletMesh

# Function: createSSRWalletMesh()

> **createSSRWalletMesh**(`config`, `options?`): `Promise`

Defined in: [core/modal-react/src/utils/ssr-walletmesh.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/utils/ssr-walletmesh.ts#L48)

Create a WalletMesh instance that automatically handles SSR/browser environments

This function leverages modal-core's built-in SSR detection and provides
the appropriate client implementation for the current environment.

## Parameters

### config

[`WalletMeshConfig`](../interfaces/WalletMeshConfig.md)

WalletMesh configuration

### options?

Additional creation options including SSR overrides

#### forceSSR?

`boolean`

Override SSR detection for testing

#### ssr?

`boolean`

## Returns

`Promise`

WalletMesh client appropriate for the current environment

## Example

```typescript
// Automatic SSR detection
const client = createSSRWalletMesh(config);

// Force SSR mode
const ssrClient = createSSRWalletMesh(config, { ssr: true });

// Force browser mode (testing)
const browserClient = createSSRWalletMesh(config, { ssr: false });
```
