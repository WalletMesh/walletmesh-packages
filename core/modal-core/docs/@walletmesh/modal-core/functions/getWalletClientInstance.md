[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getWalletClientInstance

# Function: getWalletClientInstance()

> **getWalletClientInstance**(`config`, `options?`, `instanceKey?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletMeshClient`](../interfaces/WalletMeshClient.md)\>

Get or create a WalletClient instance

By default, returns a singleton instance. Pass a unique key to create
separate instances for different parts of your app.

## Parameters

### config

[`WalletMeshConfig`](../interfaces/WalletMeshConfig.md)

WalletMesh configuration

### options?

[`CreateWalletMeshOptions`](../interfaces/CreateWalletMeshOptions.md)

Creation options

### instanceKey?

`string` = `SINGLETON_KEY`

Optional key for multiple instances

## Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletMeshClient`](../interfaces/WalletMeshClient.md)\>

Promise that resolves to WalletClient instance

## Example

```typescript
// Singleton usage (recommended for most apps)
const client = await getWalletClientInstance({
  appName: 'My App'
});

// Multiple instances (for advanced use cases)
const mainClient = await getWalletClientInstance(config, {}, 'main');
const adminClient = await getWalletClientInstance(adminConfig, {}, 'admin');
```
