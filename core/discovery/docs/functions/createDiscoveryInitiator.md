[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / createDiscoveryInitiator

# Function: createDiscoveryInitiator()

> **createDiscoveryInitiator**(`config`): [`DiscoveryInitiator`](../classes/DiscoveryInitiator.md)

Defined in: [initiator/factory.ts:71](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/factory.ts#L71)

Create a discovery listener with comprehensive validation and configuration helpers.

Factory function that creates and configures a DiscoveryInitiator instance with
built-in validation of all parameters. Provides a simplified interface for
common discovery scenarios while maintaining full configuration flexibility.

## Parameters

### config

Configuration object for the discovery listener

#### eventTarget?

`EventTarget`

#### initiatorInfo

[`InitiatorInfo`](../interfaces/InitiatorInfo.md)

#### preferences?

[`CapabilityPreferences`](../interfaces/CapabilityPreferences.md)

#### requirements

[`CapabilityRequirements`](../interfaces/CapabilityRequirements.md)

#### securityPolicy?

[`SecurityPolicy`](../interfaces/SecurityPolicy.md)

#### timeout?

`number`

## Returns

[`DiscoveryInitiator`](../classes/DiscoveryInitiator.md)

Configured DiscoveryInitiator instance ready for use

## Throws

If configuration validation fails

## Examples

```typescript
const listener = createDiscoveryInitiator({
  requirements: {
    chains: ['eip155:1'],
    features: ['account-management', 'transaction-signing'],
    interfaces: ['eip-1193']
  },
  initiatorInfo: {
    name: 'My DeFi App',
    url: 'https://myapp.com',
    icon: 'data:image/svg+xml;base64,...'
  },
  timeout: 5000
});

const responders = await listener.startDiscovery();
```

```typescript
const listener = createDiscoveryInitiator({
  requirements: {
    chains: ['eip155:1', 'eip155:137'],
    features: ['account-management'],
    interfaces: ['eip-1193']
  },
  preferences: {
    chains: ['eip155:5'], // Optional testnet support
    features: ['hardware-wallet']
  },
  initiatorInfo: {
    name: 'Multi-Chain DApp',
    url: 'https://myapp.com',
    icon: 'data:image/png;base64,...'
  },
  securityPolicy: createSecurityPolicy.strict({
    allowedOrigins: ['https://trusted-wallet.com']
  }),
  timeout: 10000
});
```

## Since

0.1.0

## See

 - [DiscoveryInitiator](../classes/DiscoveryInitiator.md) for the created instance
 - [createCapabilityRequirements](../variables/createCapabilityRequirements.md) for requirement helpers
 - [createSecurityPolicy](../variables/createSecurityPolicy.md) for security configuration
