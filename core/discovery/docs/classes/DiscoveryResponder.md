[**@walletmesh/discovery v0.1.4**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryResponder

# Class: DiscoveryResponder

Defined in: [core/discovery/src/responder.ts:84](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/responder.ts#L84)

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

Defined in: [core/discovery/src/responder.ts:103](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/responder.ts#L103)

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

Defined in: [core/discovery/src/responder.ts:244](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/responder.ts#L244)

Cleanup resources and stop listening.

#### Returns

`void`

***

### getStats()

> **getStats**(): `object`

Defined in: [core/discovery/src/responder.ts:232](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/responder.ts#L232)

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

### handleRequestProcessingError()

> `protected` **handleRequestProcessingError**(`error`, `request?`): `boolean`

Defined in: [core/discovery/src/responder.ts:394](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/responder.ts#L394)

#### Parameters

##### error

`unknown`

##### request?

[`DiscoveryRequestEvent`](../interfaces/DiscoveryRequestEvent.md)

#### Returns

`boolean`

***

### handleResponseSendingError()

> `protected` **handleResponseSendingError**(`error`, `request`): `void`

Defined in: [core/discovery/src/responder.ts:437](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/responder.ts#L437)

#### Parameters

##### error

`Error`

##### request

[`DiscoveryRequestEvent`](../interfaces/DiscoveryRequestEvent.md)

#### Returns

`void`

***

### isAnnouncerListening()

> **isAnnouncerListening**(): `boolean`

Defined in: [core/discovery/src/responder.ts:189](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/responder.ts#L189)

Check if the responder is currently listening for requests.

#### Returns

`boolean`

***

### isValidRequest()

> `protected` **isValidRequest**(`request`): `boolean`

Defined in: [core/discovery/src/responder.ts:374](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/responder.ts#L374)

#### Parameters

##### request

[`DiscoveryRequestEvent`](../interfaces/DiscoveryRequestEvent.md)

#### Returns

`boolean`

***

### startListening()

> **startListening**(): `void`

Defined in: [core/discovery/src/responder.ts:146](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/responder.ts#L146)

Start listening for discovery requests.

Begins monitoring for discovery requests and automatically responds
to requests that match the wallet's capabilities. Safe to call
multiple times (idempotent).

#### Returns

`void`

***

### stopListening()

> **stopListening**(): `void`

Defined in: [core/discovery/src/responder.ts:167](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/responder.ts#L167)

Stop listening for discovery requests.

Stops monitoring for discovery requests and removes event listeners.
The wallet becomes undiscoverable until startListening() is called again.
Safe to call multiple times (idempotent).

#### Returns

`void`

***

### updateConfig()

> **updateConfig**(`updates`): `void`

Defined in: [core/discovery/src/responder.ts:214](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/responder.ts#L214)

Update responder configuration without restarting.

#### Parameters

##### updates

`Partial`\<[`DiscoveryResponderConfig`](../interfaces/DiscoveryResponderConfig.md)\>

#### Returns

`void`

***

### updateResponderInfo()

> **updateResponderInfo**(`responderInfo`): `void`

Defined in: [core/discovery/src/responder.ts:196](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/responder.ts#L196)

Update responder information while maintaining discovery state.

#### Parameters

##### responderInfo

[`ResponderInfo`](../type-aliases/ResponderInfo.md)

#### Returns

`void`
