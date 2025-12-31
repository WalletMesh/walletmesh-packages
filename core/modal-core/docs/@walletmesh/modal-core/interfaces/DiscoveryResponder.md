[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DiscoveryResponder

# Interface: DiscoveryResponder

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

## Methods

### cleanup()

> **cleanup**(): `void`

Cleanup resources and stop listening.

#### Returns

`void`

***

### getStats()

> **getStats**(): `object`

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

> **responderType**: `ResponderType`

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

#### Parameters

##### error

`unknown`

##### request?

[`DiscoveryRequestEvent`](DiscoveryRequestEvent.md)

#### Returns

`boolean`

***

### handleResponseSendingError()

> `protected` **handleResponseSendingError**(`error`, `request`): `void`

#### Parameters

##### error

`Error`

##### request

[`DiscoveryRequestEvent`](DiscoveryRequestEvent.md)

#### Returns

`void`

***

### isAnnouncerListening()

> **isAnnouncerListening**(): `boolean`

Check if the responder is currently listening for requests.

#### Returns

`boolean`

***

### isValidRequest()

> `protected` **isValidRequest**(`request`): `boolean`

#### Parameters

##### request

[`DiscoveryRequestEvent`](DiscoveryRequestEvent.md)

#### Returns

`boolean`

***

### startListening()

> **startListening**(): `void`

Start listening for discovery requests.

Begins monitoring for discovery requests and automatically responds
to requests that match the wallet's capabilities. Safe to call
multiple times (idempotent).

#### Returns

`void`

***

### stopListening()

> **stopListening**(): `void`

Stop listening for discovery requests.

Stops monitoring for discovery requests and removes event listeners.
The wallet becomes undiscoverable until startListening() is called again.
Safe to call multiple times (idempotent).

#### Returns

`void`

***

### updateConfig()

> **updateConfig**(`updates`): `void`

Update responder configuration without restarting.

#### Parameters

##### updates

`Partial`\<`DiscoveryResponderConfig`\>

#### Returns

`void`

***

### updateResponderInfo()

> **updateResponderInfo**(`responderInfo`): `void`

Update responder information while maintaining discovery state.

#### Parameters

##### responderInfo

[`ResponderInfo`](../type-aliases/ResponderInfo.md)

#### Returns

`void`
