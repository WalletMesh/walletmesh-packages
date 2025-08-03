[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / createResponderDiscoverySetup

# Function: createResponderDiscoverySetup()

> **createResponderDiscoverySetup**(`config`): `object`

Defined in: [responder/factory.ts:175](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/responder/factory.ts#L175)

Create a complete responder discovery setup with integrated announcer and matcher.

High-level factory function that creates a full responder-side discovery setup
including both announcement and capability matching components. Provides a
streamlined interface for responder integration with automatic synchronization.

## Parameters

### config

Configuration for responder discovery components

#### eventTarget?

`EventTarget`

#### responderInfo

[`ResponderInfo`](../type-aliases/ResponderInfo.md)

#### securityPolicy?

[`SecurityPolicy`](../interfaces/SecurityPolicy.md)

## Returns

Object with discovery components and convenience methods

### capabilityMatcher

> **capabilityMatcher**: [`CapabilityMatcher`](../classes/CapabilityMatcher.md)

### discoveryAnnouncer

> **discoveryAnnouncer**: [`DiscoveryResponder`](../classes/DiscoveryResponder.md)

### cleanup()

> **cleanup**(): `void`

Clean up resources and stop listening.

#### Returns

`void`

### getStats()

> **getStats**(): `object`

Get combined statistics from both components.

#### Returns

`object`

##### announcer

> **announcer**: `object`

###### announcer.capabilityDetails

> **capabilityDetails**: `object`

###### announcer.capabilityDetails.chainCount

> **chainCount**: `number`

###### announcer.capabilityDetails.featureCount

> **featureCount**: `number`

###### announcer.capabilityDetails.responderType

> **responderType**: [`ResponderType`](../type-aliases/ResponderType.md)

###### announcer.capabilityDetails.supportedChains

> **supportedChains**: `string`[]

###### announcer.capabilityDetails.supportedFeatures

> **supportedFeatures**: `string`[]

###### announcer.capabilityDetails.supportedInterfaces

> **supportedInterfaces**: `string`[]

###### announcer.isListening

> **isListening**: `boolean`

###### announcer.responderInfo

> **responderInfo**: `object`

###### announcer.responderInfo.chainCount

> **chainCount**: `number`

###### announcer.responderInfo.featureCount

> **featureCount**: `number`

###### announcer.responderInfo.id

> **id**: `string`

###### announcer.responderInfo.name

> **name**: `string`

###### announcer.responderInfo.rdns

> **rdns**: `string`

###### announcer.responderInfo.type

> **type**: [`ResponderType`](../type-aliases/ResponderType.md)

###### announcer.securityStats

> **securityStats**: `object`

###### announcer.securityStats.activeOrigins

> **activeOrigins**: `number` = `0`

###### announcer.securityStats.averageRequestsPerOrigin

> **averageRequestsPerOrigin**: `number` = `0`

###### announcer.securityStats.memoryUsage

> **memoryUsage**: `object`

###### announcer.securityStats.memoryUsage.requestMaps

> **requestMaps**: `number`

###### announcer.securityStats.memoryUsage.totalRequestEntries

> **totalRequestEntries**: `number` = `0`

###### announcer.securityStats.rateLimitedOrigins

> **rateLimitedOrigins**: `number` = `0`

###### announcer.securityStats.totalOrigins

> **totalOrigins**: `number` = `origins.length`

###### announcer.securityStats.totalRequests

> **totalRequests**: `number` = `0`

###### announcer.securityStats.usedSessionsCount

> **usedSessionsCount**: `number`

##### matcher

> **matcher**: `object`

###### matcher.chainCount

> **chainCount**: `number`

###### matcher.featureCount

> **featureCount**: `number`

###### matcher.responderType

> **responderType**: [`ResponderType`](../type-aliases/ResponderType.md)

###### matcher.supportedChains

> **supportedChains**: `string`[]

###### matcher.supportedFeatures

> **supportedFeatures**: `string`[]

###### matcher.supportedInterfaces

> **supportedInterfaces**: `string`[]

### startListening()

> **startListening**(): `void`

Start listening for discovery requests.

#### Returns

`void`

### stopListening()

> **stopListening**(): `void`

Stop listening for discovery requests.

#### Returns

`void`

### updateResponderInfo()

> **updateResponderInfo**(`responderInfo`): `void`

Update responder information for both components.

#### Parameters

##### responderInfo

[`ResponderInfo`](../type-aliases/ResponderInfo.md)

#### Returns

`void`

## Example

```typescript
const setup = createResponderDiscoverySetup({
  responderInfo: {
    uuid: crypto.randomUUID(),
    rdns: 'com.mycompany.wallet',
    name: 'My Wallet',
    icon: 'data:image/svg+xml;base64,...',
    type: 'extension',
    version: '1.0.0',
    protocolVersion: '0.1.0',
    chains: [], // supported chains
    features: [] // wallet features
  },
  securityPolicy: {
    requireHttps: true,
    allowedOrigins: ['https://trusted-dapp.com'],
    rateLimit: { enabled: true, maxRequests: 10, windowMs: 60000 }
  }
});

// Start discovery
setup.startListening();

// Update capabilities dynamically
setup.updateResponderInfo(updatedResponderInfo);

// Monitor activity
const stats = setup.getStats();
console.log('Discovery stats:', stats);

// Cleanup when done
setup.cleanup();
```

## Since

0.1.0

## See

 - [createDiscoveryResponder](createDiscoveryResponder.md) for announcer configuration
 - [createCapabilityMatcher](createCapabilityMatcher.md) for matcher configuration
