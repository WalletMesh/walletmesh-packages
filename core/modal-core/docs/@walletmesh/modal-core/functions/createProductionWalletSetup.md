[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createProductionWalletSetup

# Function: createProductionWalletSetup()

> **createProductionWalletSetup**(`appName`, `additionalConfig`): `object`

Create a production-focused wallet client setup

This function creates a wallet client setup optimized for production
with performance optimizations and minimal logging.

## Parameters

### appName

`string`

Application name

### additionalConfig

`Partial`\<[`WalletMeshClientConfig`](../type-aliases/WalletMeshClientConfig.md)\> = `{}`

Additional configuration

## Returns

`object`

Complete production setup

### client

> **client**: [`WalletMeshClient`](../interfaces/WalletMeshClient.md)

### connectionManager

> **connectionManager**: [`ConnectionManager`](../classes/ConnectionManager.md)

### destroy()

> **destroy**: () => [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

### discoveryService

> **discoveryService**: [`DiscoveryService`](../classes/DiscoveryService.md)

### eventSystem

> **eventSystem**: [`EventSystem`](../classes/EventSystem.md)

## Example

```typescript
const setup = createProductionWalletSetup('My DApp', {
  appUrl: 'https://mydapp.com',
  appIcon: 'https://mydapp.com/icon.png',
  projectId: 'your-walletconnect-project-id'
});

await setup.client.initialize();
```
