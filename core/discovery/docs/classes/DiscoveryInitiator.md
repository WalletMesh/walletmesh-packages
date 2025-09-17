[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryInitiator

# Class: DiscoveryInitiator

Defined in: [core/discovery/src/initiator.ts:85](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/initiator.ts#L85)

Discovery initiator for dApps to find qualified wallets.

Simplified implementation with clean constructor pattern that uses presets
for common configurations. Replaces the complex factory function pattern.

## Examples

```typescript
import { DiscoveryInitiator, CAPABILITY_PRESETS } from '@walletmesh/discovery';

const initiator = new DiscoveryInitiator(
  CAPABILITY_PRESETS.ethereum,
  { name: 'My App', url: 'https://myapp.com' }
);

const wallets = await initiator.startDiscovery();
```

```typescript
const initiator = new DiscoveryInitiator(
  CAPABILITY_PRESETS.multiChain,
  { name: 'DeFi App', url: 'https://defi.com' },
  {
    security: 'production',
    timeout: 10000
  },
  { features: ['hardware-wallet'] }
);
```

## Since

0.1.0

## Constructors

### Constructor

> **new DiscoveryInitiator**(`requirements`, `initiatorInfo`, `options`, `preferences?`): `DiscoveryInitiator`

Defined in: [core/discovery/src/initiator.ts:106](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/initiator.ts#L106)

Create a new DiscoveryInitiator instance.

#### Parameters

##### requirements

[`CapabilityRequirements`](../interfaces/CapabilityRequirements.md)

Capability requirements (use CAPABILITY_PRESETS for common scenarios)

##### initiatorInfo

[`InitiatorInfo`](../interfaces/InitiatorInfo.md)

Information about the requesting application

##### options

[`DiscoveryInitiatorOptions`](../interfaces/DiscoveryInitiatorOptions.md) = `{}`

Optional configuration (security, timeout, etc.)

##### preferences?

[`CapabilityPreferences`](../interfaces/CapabilityPreferences.md)

Optional capability preferences for enhanced matching

#### Returns

`DiscoveryInitiator`

## Methods

### getQualifiedResponder()

> **getQualifiedResponder**(`responderId`): `undefined` \| [`QualifiedResponder`](../interfaces/QualifiedResponder.md)

Defined in: [core/discovery/src/initiator.ts:227](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/initiator.ts#L227)

Get a specific qualified responder by ID.

#### Parameters

##### responderId

`string`

#### Returns

`undefined` \| [`QualifiedResponder`](../interfaces/QualifiedResponder.md)

***

### getQualifiedResponders()

> **getQualifiedResponders**(): [`QualifiedResponder`](../interfaces/QualifiedResponder.md)[]

Defined in: [core/discovery/src/initiator.ts:220](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/initiator.ts#L220)

Get qualified responders found during discovery.

#### Returns

[`QualifiedResponder`](../interfaces/QualifiedResponder.md)[]

***

### isDiscovering()

> **isDiscovering**(): `boolean`

Defined in: [core/discovery/src/initiator.ts:234](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/initiator.ts#L234)

Check if discovery is currently active.

#### Returns

`boolean`

***

### startDiscovery()

> **startDiscovery**(): `Promise`\<[`QualifiedResponder`](../interfaces/QualifiedResponder.md)[]\>

Defined in: [core/discovery/src/initiator.ts:153](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/initiator.ts#L153)

Start discovery process to find qualified wallets.

#### Returns

`Promise`\<[`QualifiedResponder`](../interfaces/QualifiedResponder.md)[]\>

Promise that resolves with array of qualified responders

***

### stopDiscovery()

> **stopDiscovery**(): `void`

Defined in: [core/discovery/src/initiator.ts:206](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/initiator.ts#L206)

Stop discovery process and cleanup resources.

#### Returns

`void`
