[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createWalletMeshClient

# Function: createWalletMeshClient()

> **createWalletMeshClient**(`appName`, `additionalConfig`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletMeshClient`](../interfaces/WalletMeshClient.md)\>

Creates a WalletMeshClient instance with sensible defaults and automatic initialization.

**This is the recommended API for most use cases.** The client is automatically initialized
and ready to use immediately after the promise resolves.

This async function:
- Creates the client with sensible defaults
- Automatically calls `initialize()`
- Returns a fully initialized, ready-to-use client

## Parameters

### appName

`string`

Name of the application

### additionalConfig

`Partial`\<[`WalletMeshClientConfig`](../type-aliases/WalletMeshClientConfig.md)\> = `{}`

Additional configuration options

## Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletMeshClient`](../interfaces/WalletMeshClient.md)\>

Promise resolving to a fully initialized WalletMeshClient instance

## Examples

```typescript
// Recommended: Async with auto-initialization
const client = await createWalletMeshClient('My DApp', {
  chains: [
    { chainId: '1', chainType: 'evm', name: 'Ethereum' },
    { chainId: '137', chainType: 'evm', name: 'Polygon' }
  ]
});
// Client is ready to use immediately
const connection = await client.connectWithModal();
```

```typescript
// For advanced users who need manual control, use createWalletMeshClientSync
const client = createWalletMeshClientSync('My DApp', config);
await client.initialize(); // Manual initialization
```

## Since

1.1.0
