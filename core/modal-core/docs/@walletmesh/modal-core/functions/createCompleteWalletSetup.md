[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createCompleteWalletSetup

# Function: createCompleteWalletSetup()

> **createCompleteWalletSetup**(`setup`): `object`

Creates a complete wallet client setup with all services configured

This is a convenience function that creates a WalletMeshClient with
ConnectionManager, DiscoveryService, and EventSystem all properly
integrated and configured.

## Parameters

### setup

[`WalletClientSetup`](../interfaces/WalletClientSetup.md)

Complete setup configuration

## Returns

`object`

Object with all client services

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
const { client, connectionManager, discoveryService, eventSystem } = createCompleteWalletSetup({
  client: {
    appName: 'My DApp',
    chains: [{ chainId: '1', chainType: ChainType.Evm, name: 'Ethereum', required: false }]
  },
  connectionRecovery: {
    autoReconnect: true,
    maxReconnectAttempts: 3
  },
  discovery: {
    enabled: true,
    retryInterval: 30000
  },
  events: {
    maxHistorySize: 1000,
    enableReplay: true
  }
});

await client.initialize();
```
