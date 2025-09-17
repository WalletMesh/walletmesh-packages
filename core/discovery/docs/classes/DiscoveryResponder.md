[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryResponder

# Class: DiscoveryResponder

Defined in: [core/discovery/src/responder.ts:81](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/responder.ts#L81)

Discovery responder for wallets to participate in discovery protocol.

Simplified implementation with clean constructor pattern that uses presets
for common configurations. Replaces the complex factory function pattern.

## Examples

```typescript
import { DiscoveryResponder, RESPONDER_PRESETS, FEATURE_PRESETS } from '@walletmesh/discovery';

const responder = new DiscoveryResponder({
  uuid: crypto.randomUUID(),
  rdns: 'com.mycompany.wallet',
  name: 'My Wallet',
  icon: 'data:image/svg+xml;base64,...',
  type: 'extension',
  version: '1.0.0',
  protocolVersion: '0.1.0',
  technologies: [RESPONDER_PRESETS.ethereum],
  features: FEATURE_PRESETS.basic
});

responder.startListening();
```

```typescript
const responder = new DiscoveryResponder(
  responderInfo,
  { security: 'production' }
);
```

## Since

0.1.0

## Constructors

### Constructor

> **new DiscoveryResponder**(`responderInfo`, `options`): `DiscoveryResponder`

Defined in: [core/discovery/src/responder.ts:100](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/responder.ts#L100)

Create a new DiscoveryResponder instance.

#### Parameters

##### responderInfo

[`ResponderInfo`](../type-aliases/ResponderInfo.md)

Information about the wallet/responder

##### options

[`DiscoveryResponderOptions`](../interfaces/DiscoveryResponderOptions.md) = `{}`

Optional configuration (security, sessions, etc.)

#### Returns

`DiscoveryResponder`

## Methods

### cleanup()

> **cleanup**(): `void`

Defined in: [core/discovery/src/responder.ts:249](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/responder.ts#L249)

Cleanup resources and stop listening.

#### Returns

`void`

***

### getStats()

> **getStats**(): `object`

Defined in: [core/discovery/src/responder.ts:237](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/responder.ts#L237)

Get responder statistics.

#### Returns

`object`

##### activeSessionsCount

> **activeSessionsCount**: `number`

##### capabilityDetails

> **capabilityDetails**: `object`

###### capabilityDetails.featureCount

> **featureCount**: `number`

###### capabilityDetails.responderType

> **responderType**: [`ResponderType`](../type-aliases/ResponderType.md)

###### capabilityDetails.supportedFeatures

> **supportedFeatures**: `string`[]

###### capabilityDetails.supportedInterfaces

> **supportedInterfaces**: `string`[]

###### capabilityDetails.supportedTechnologies

> **supportedTechnologies**: `string`[]

###### capabilityDetails.technologyCount

> **technologyCount**: `number`

##### isListening

> **isListening**: `boolean`

##### usedSessionsCount

> **usedSessionsCount**: `number`

***

### isAnnouncerListening()

> **isAnnouncerListening**(): `boolean`

Defined in: [core/discovery/src/responder.ts:199](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/responder.ts#L199)

Check if the responder is currently listening for requests.

#### Returns

`boolean`

***

### startListening()

> **startListening**(): `void`

Defined in: [core/discovery/src/responder.ts:156](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/responder.ts#L156)

Start listening for discovery requests.

Begins monitoring for discovery requests and automatically responds
to requests that match the wallet's capabilities. Safe to call
multiple times (idempotent).

#### Returns

`void`

***

### stopListening()

> **stopListening**(): `void`

Defined in: [core/discovery/src/responder.ts:177](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/responder.ts#L177)

Stop listening for discovery requests.

Stops monitoring for discovery requests and removes event listeners.
The wallet becomes undiscoverable until startListening() is called again.
Safe to call multiple times (idempotent).

#### Returns

`void`

***

### updateConfig()

> **updateConfig**(`updates`): `void`

Defined in: [core/discovery/src/responder.ts:219](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/responder.ts#L219)

Update responder configuration without restarting.

#### Parameters

##### updates

`Partial`\<[`DiscoveryResponderConfig`](../interfaces/DiscoveryResponderConfig.md)\>

#### Returns

`void`

***

### updateResponderInfo()

> **updateResponderInfo**(`responderInfo`): `void`

Defined in: [core/discovery/src/responder.ts:206](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/responder.ts#L206)

Update responder information while maintaining discovery state.

#### Parameters

##### responderInfo

[`ResponderInfo`](../type-aliases/ResponderInfo.md)

#### Returns

`void`
