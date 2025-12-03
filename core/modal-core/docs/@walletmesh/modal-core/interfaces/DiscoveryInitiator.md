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

## Properties

### config

> `protected` **config**: [`DiscoveryInitiatorConfig`](DiscoveryInitiatorConfig.md)

***

### discoveryRejecter

> `protected` **discoveryRejecter**: `null` \| (`error`) => `void`

***

### discoveryResolver

> `protected` **discoveryResolver**: `null` \| (`value`) => `void`

***

### eventTarget

> `protected` **eventTarget**: `EventTarget`

***

### firstResponses

> `protected` **firstResponses**: [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, [`DiscoveryResponseEvent`](DiscoveryResponseEvent.md)\>

***

### lastKnownState

> `protected` **lastKnownState**: `ProtocolState`

***

### logger

> `protected` **logger**: `Logger`

***

### qualifiedWallets

> `protected` **qualifiedWallets**: [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, [`QualifiedWallet`](QualifiedWallet.md)\>

***

### responseHandler

> `protected` **responseHandler**: `DiscoveryResponseEventHandler`

***

### seenResponders

> `protected` **seenResponders**: [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, `number`\>

***

### sessionId

> `protected` **sessionId**: `null` \| `string`

***

### stateMachine

> `protected` **stateMachine**: `null` \| `InitiatorStateMachine`

## Methods

### dispose()

> **dispose**(): `void`

Dispose of the discovery initiator and release resources.

#### Returns

`void`

***

### enhanceError()

> `protected` **enhanceError**(`error`): `Error`

#### Parameters

##### error

`Error`

#### Returns

`Error`

***

### getCurrentSessionId()

> **getCurrentSessionId**(): `null` \| `string`

Get the current discovery session ID if discovery has started.

#### Returns

`null` \| `string`

***

### getOrigin()

> `protected` **getOrigin**(): `string`

Determine origin with graceful fallbacks.
Priority: valid initiatorInfo.url -> window.location.origin -> http://localhost

#### Returns

`string`

***

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

### getState()

> **getState**(): `string`

Get the current protocol state for the discovery session.

#### Returns

`string`

***

### getStats()

> **getStats**(): `object`

Get discovery statistics for diagnostics and testing.

#### Returns

`object`

##### config

> **config**: `object`

###### config.preferencesCount

> **preferencesCount**: `null` \| \{ `features`: `number`; `technologies`: `number`; \}

###### config.requirementsCount

> **requirementsCount**: `object`

###### config.requirementsCount.features

> **features**: `number`

###### config.requirementsCount.technologies

> **technologies**: `number`

###### config.timeout

> **timeout**: `number`

##### currentState

> **currentState**: `string`

##### qualifiedWallets

> **qualifiedWallets**: [`QualifiedWallet`](QualifiedWallet.md)[]

##### qualifiedWalletsCount

> **qualifiedWalletsCount**: `number`

##### securityStats

> **securityStats**: `object`

###### securityStats.duplicateResponses

> **duplicateResponses**: `object`[]

###### securityStats.seenRespondersCount

> **seenRespondersCount**: `number`

##### sessionId

> **sessionId**: `null` \| `string`

***

### isDiscovering()

> **isDiscovering**(): `boolean`

Check if discovery is currently active.

#### Returns

`boolean`

***

### reset()

> **reset**(): `void`

Reset the discovery initiator for reuse between sessions.

#### Returns

`void`

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

***

### updateConfig()

> **updateConfig**(`config`): `void`

Update the discovery configuration for future sessions.

#### Parameters

##### config

`Partial`\<[`DiscoveryInitiatorConfig`](DiscoveryInitiatorConfig.md)\>

#### Returns

`void`
