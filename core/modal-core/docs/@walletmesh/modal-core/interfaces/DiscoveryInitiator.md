[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DiscoveryInitiator

# Interface: DiscoveryInitiator

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

## Methods

### getQualifiedResponder()

> **getQualifiedResponder**(`responderId`): `undefined` \| [`QualifiedWallet`](QualifiedWallet.md)

Get a specific qualified responder by ID.

#### Parameters

##### responderId

`string`

#### Returns

`undefined` \| [`QualifiedWallet`](QualifiedWallet.md)

***

### getQualifiedResponders()

> **getQualifiedResponders**(): [`QualifiedWallet`](QualifiedWallet.md)[]

Get qualified responders found during discovery.

#### Returns

[`QualifiedWallet`](QualifiedWallet.md)[]

***

### isDiscovering()

> **isDiscovering**(): `boolean`

Check if discovery is currently active.

#### Returns

`boolean`

***

### startDiscovery()

> **startDiscovery**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`QualifiedWallet`](QualifiedWallet.md)[]\>

Start discovery process to find qualified wallets.

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`QualifiedWallet`](QualifiedWallet.md)[]\>

Promise that resolves with array of qualified responders

***

### stopDiscovery()

> **stopDiscovery**(): `void`

Stop discovery process and cleanup resources.

#### Returns

`void`
