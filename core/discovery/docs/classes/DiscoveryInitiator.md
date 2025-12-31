[**@walletmesh/discovery v0.1.4**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryInitiator

# Class: DiscoveryInitiator

Defined in: [core/discovery/src/initiator.ts:108](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L108)

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

Defined in: [core/discovery/src/initiator.ts:130](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L130)

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

## Properties

### config

> `protected` **config**: [`DiscoveryInitiatorConfig`](../interfaces/DiscoveryInitiatorConfig.md)

Defined in: [core/discovery/src/initiator.ts:109](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L109)

***

### discoveryRejecter

> `protected` **discoveryRejecter**: `null` \| (`error`) => `void` = `null`

Defined in: [core/discovery/src/initiator.ts:116](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L116)

***

### discoveryResolver

> `protected` **discoveryResolver**: `null` \| (`value`) => `void` = `null`

Defined in: [core/discovery/src/initiator.ts:115](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L115)

***

### eventTarget

> `protected` **eventTarget**: `EventTarget`

Defined in: [core/discovery/src/initiator.ts:110](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L110)

***

### firstResponses

> `protected` **firstResponses**: `Map`\<`string`, [`DiscoveryResponseEvent`](../interfaces/DiscoveryResponseEvent.md)\>

Defined in: [core/discovery/src/initiator.ts:118](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L118)

***

### lastKnownState

> `protected` **lastKnownState**: [`ProtocolState`](../type-aliases/ProtocolState.md) = `'IDLE'`

Defined in: [core/discovery/src/initiator.ts:120](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L120)

***

### logger

> `protected` **logger**: [`Logger`](../interfaces/Logger.md)

Defined in: [core/discovery/src/initiator.ts:119](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L119)

***

### qualifiedWallets

> `protected` **qualifiedWallets**: `Map`\<`string`, [`QualifiedResponder`](../interfaces/QualifiedResponder.md)\>

Defined in: [core/discovery/src/initiator.ts:111](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L111)

***

### responseHandler

> `protected` **responseHandler**: [`DiscoveryResponseEventHandler`](../type-aliases/DiscoveryResponseEventHandler.md)

Defined in: [core/discovery/src/initiator.ts:114](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L114)

***

### seenResponders

> `protected` **seenResponders**: `Map`\<`string`, `number`\>

Defined in: [core/discovery/src/initiator.ts:117](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L117)

***

### sessionId

> `protected` **sessionId**: `null` \| `string` = `null`

Defined in: [core/discovery/src/initiator.ts:112](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L112)

***

### stateMachine

> `protected` **stateMachine**: `null` \| [`InitiatorStateMachine`](InitiatorStateMachine.md) = `null`

Defined in: [core/discovery/src/initiator.ts:113](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L113)

## Methods

### dispose()

> **dispose**(): `void`

Defined in: [core/discovery/src/initiator.ts:371](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L371)

Dispose of the discovery initiator and release resources.

#### Returns

`void`

***

### enhanceError()

> `protected` **enhanceError**(`error`): `Error`

Defined in: [core/discovery/src/initiator.ts:692](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L692)

#### Parameters

##### error

`Error`

#### Returns

`Error`

***

### getCurrentSessionId()

> **getCurrentSessionId**(): `null` \| `string`

Defined in: [core/discovery/src/initiator.ts:293](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L293)

Get the current discovery session ID if discovery has started.

#### Returns

`null` \| `string`

***

### getOrigin()

> `protected` **getOrigin**(): `string`

Defined in: [core/discovery/src/initiator.ts:267](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L267)

Determine origin with graceful fallbacks.
Priority: valid initiatorInfo.url -> window.location.origin -> http://localhost

#### Returns

`string`

***

### getQualifiedResponder()

> **getQualifiedResponder**(`responderId`): `undefined` \| [`QualifiedResponder`](../interfaces/QualifiedResponder.md)

Defined in: [core/discovery/src/initiator.ts:286](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L286)

Get a specific qualified responder by ID.

#### Parameters

##### responderId

`string`

#### Returns

`undefined` \| [`QualifiedResponder`](../interfaces/QualifiedResponder.md)

***

### getQualifiedResponders()

> **getQualifiedResponders**(): [`QualifiedResponder`](../interfaces/QualifiedResponder.md)[]

Defined in: [core/discovery/src/initiator.ts:259](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L259)

Get qualified responders found during discovery.

#### Returns

[`QualifiedResponder`](../interfaces/QualifiedResponder.md)[]

***

### getState()

> **getState**(): `string`

Defined in: [core/discovery/src/initiator.ts:300](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L300)

Get the current protocol state for the discovery session.

#### Returns

`string`

***

### getStats()

> **getStats**(): `object`

Defined in: [core/discovery/src/initiator.ts:307](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L307)

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

> **qualifiedWallets**: [`QualifiedResponder`](../interfaces/QualifiedResponder.md)[]

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

Defined in: [core/discovery/src/initiator.ts:415](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L415)

Check if discovery is currently active.

#### Returns

`boolean`

***

### reset()

> **reset**(): `void`

Defined in: [core/discovery/src/initiator.ts:356](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L356)

Reset the discovery initiator for reuse between sessions.

#### Returns

`void`

***

### startDiscovery()

> **startDiscovery**(): `Promise`\<[`QualifiedResponder`](../interfaces/QualifiedResponder.md)[]\>

Defined in: [core/discovery/src/initiator.ts:166](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L166)

Start discovery process to find qualified wallets.

#### Returns

`Promise`\<[`QualifiedResponder`](../interfaces/QualifiedResponder.md)[]\>

Promise that resolves with array of qualified responders

***

### stopDiscovery()

> **stopDiscovery**(): `void`

Defined in: [core/discovery/src/initiator.ts:229](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L229)

Stop discovery process and cleanup resources.

#### Returns

`void`

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [core/discovery/src/initiator.ts:378](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/initiator.ts#L378)

Update the discovery configuration for future sessions.

#### Parameters

##### config

`Partial`\<[`DiscoveryInitiatorConfig`](../interfaces/DiscoveryInitiatorConfig.md)\>

#### Returns

`void`
