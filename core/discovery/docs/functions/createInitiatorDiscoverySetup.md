[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / createInitiatorDiscoverySetup

# Function: createInitiatorDiscoverySetup()

> **createInitiatorDiscoverySetup**(`config`): `object`

Defined in: [initiator/factory.ts:126](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/factory.ts#L126)

Create a simplified discovery setup focused only on discovery (no connection management).

Streamlined factory function that creates a discovery listener with sensible defaults
for common use cases. Connection handling is left to modal-core and modal-react packages.

## Parameters

### config

Configuration object with chains and optional settings

#### chains

`string`[]

#### eventTarget?

`EventTarget`

#### initiatorInfo?

[`InitiatorInfo`](../interfaces/InitiatorInfo.md)

#### preferences?

[`CapabilityPreferences`](../interfaces/CapabilityPreferences.md)

#### requireHttps?

`boolean`

#### securityPolicy?

[`SecurityPolicy`](../interfaces/SecurityPolicy.md)

#### timeout?

`number`

## Returns

`object`

Object containing listener, config, requirements, and security policy

### config

> **config**: [`DiscoveryInitiatorConfig`](../interfaces/DiscoveryInitiatorConfig.md)

### listener

> **listener**: [`DiscoveryInitiator`](../classes/DiscoveryInitiator.md)

### requirements

> **requirements**: [`CapabilityRequirements`](../interfaces/CapabilityRequirements.md)

### securityPolicy

> **securityPolicy**: [`SecurityPolicy`](../interfaces/SecurityPolicy.md)

## Example

```typescript
const listener = createInitiatorDiscoverySetup(
  {
    chains: ['eip155:1'],
    features: ['account-management'],
    interfaces: ['eip-1193']
  },
  {
    name: 'My DApp',
    url: 'https://mydapp.com',
    icon: 'data:image/svg+xml;base64,...'
  }
);

const responders = await listener.startDiscovery();
// Use responder transport config with modal-core/modal-react for connection
```

## Since

0.1.0
