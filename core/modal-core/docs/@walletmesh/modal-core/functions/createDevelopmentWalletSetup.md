[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createDevelopmentWalletSetup

# Function: createDevelopmentWalletSetup()

> **createDevelopmentWalletSetup**(`appName`, `additionalConfig`): `object`

Create a development-focused wallet client setup

This function creates a wallet client setup optimized for development
with enhanced logging, debug features, and helpful defaults.

## Parameters

### appName

`string`

Application name

### additionalConfig

`Partial`\<[`WalletMeshClientConfig`](../type-aliases/WalletMeshClientConfig.md)\> = `{}`

Additional configuration

## Returns

`object`

Complete development setup

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
const setup = createDevelopmentWalletSetup('My DApp Dev', {
  chains: [
    { chainId: '1', chainType: ChainType.Evm, name: 'Ethereum', required: false },
    { chainId: '5', chainType: ChainType.Evm, name: 'Goerli', required: false }
  ]
});

await setup.client.initialize();
```
