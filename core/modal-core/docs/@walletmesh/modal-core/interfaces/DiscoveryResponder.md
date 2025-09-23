[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DiscoveryResponder

# Interface: DiscoveryResponder

Discovery announcer for responders to listen for discovery requests and respond
if they can fulfill the requirements.

Implements the responder-side of the capability-first discovery protocol with
comprehensive security features including origin validation, rate limiting,
and session tracking to prevent abuse and ensure secure discovery.

Features:
- Privacy-preserving: Only responds to requests it can fulfill
- Secure: Multi-layered security with origin validation and rate limiting
- Efficient: Capability intersection calculation prevents unnecessary responses
- Configurable: Flexible security policies for different deployment scenarios

## Examples

```typescript
const announcer = new DiscoveryResponder({
  responderInfo: {
    name: 'My Responder',
    rdns: 'com.example.responder',
    uuid: crypto.randomUUID(),
    version: '1.0.0',
    protocolVersion: '0.1.0',
    type: 'extension',
    icon: 'data:image/svg+xml;base64,...',
    technologies: [], // supported technologies
    features: [] // responder features
  },
  securityPolicy: {
    requireHttps: true,
    allowedOrigins: ['https://trusted-initiator.com'],
    rateLimit: {
      enabled: true,
      maxRequests: 10,
      windowMs: 60000
    }
  }
});

announcer.startListening();
```

```typescript
const devAnnouncer = new DiscoveryResponder({
  responderInfo: myResponderInfo,
  securityPolicy: {
    requireHttps: false,
    allowLocalhost: true,
    rateLimit: { enabled: false, maxRequests: 100, windowMs: 60000 }
  }
});
```

## Since

0.1.0

## See

 - [DiscoveryInitiator](DiscoveryInitiator.md) for dApp-side implementation
 - [CapabilityMatcher](../classes/CapabilityMatcher.md) for capability intersection logic
 - [OriginValidator](../classes/OriginValidator.md) for security validation

## Methods

### Configuration

#### updateConfig()

> **updateConfig**(`config`): `void`

Update announcer configuration without restarting.

Partially updates the configuration while maintaining the current
listening state. Useful for adjusting security policies or
session settings during runtime.

##### Parameters

###### config

`Partial`\<`DiscoveryResponderConfig`\>

Partial configuration updates

##### Returns

`void`

##### Example

```typescript
// Tighten security for production
announcer.updateConfig({
  securityPolicy: {
    requireHttps: true,
    allowedOrigins: ['https://production-dapp.com'],
    rateLimit: {
      enabled: true,
      maxRequests: 5,
      windowMs: 60000
    }
  }
});
```

##### Since

0.1.0

***

#### updateResponderInfo()

> **updateResponderInfo**(`responderInfo`): `void`

Update responder information while maintaining discovery state.

Updates the responder's capabilities and information used for
capability matching. The announcer continues listening with
the updated information.

##### Parameters

###### responderInfo

[`ResponderInfo`](../type-aliases/ResponderInfo.md)

New responder information

##### Returns

`void`

##### Example

```typescript
// Add support for a new blockchain
const updatedInfo = {
  ...currentResponderInfo,
  technologies: [
    ...currentResponderInfo.technologies,
    newTechnologyCapability
  ]
};

announcer.updateResponderInfo(updatedInfo);
console.log('Responder now supports additional chains');
```

##### Since

0.1.0

### Discovery

#### isAnnouncerListening()

> **isAnnouncerListening**(): `boolean`

Check if the announcer is currently listening for requests.

Returns the current listening state. Useful for UI indicators
and ensuring proper state management.

##### Returns

`boolean`

True if listening for requests, false otherwise

##### Example

```typescript
if (announcer.isAnnouncerListening()) {
  console.log('Wallet is discoverable');
} else {
  announcer.startListening();
  console.log('Started wallet discovery');
}
```

##### Since

0.1.0

***

#### startListening()

> **startListening**(): `void`

Start listening for discovery requests from dApps.

Begins monitoring for discovery requests and automatically responds
to requests that match the wallet's capabilities. Safe to call
multiple times (idempotent).

Security checks performed on each request:
- Origin validation against security policy
- Rate limiting per origin
- Session replay prevention
- Capability intersection calculation

##### Returns

`void`

##### Example

```typescript
announcer.startListening();
console.log('Wallet is now discoverable');

// Wallet will automatically respond to qualified requests
// No manual intervention required
```

##### Since

0.1.0

***

#### stopListening()

> **stopListening**(): `void`

Stop listening for discovery requests.

Stops monitoring for discovery requests and removes event listeners.
The wallet becomes undiscoverable until startListening() is called again.
Safe to call multiple times (idempotent).

##### Returns

`void`

##### Example

```typescript
// Temporarily hide wallet from discovery
announcer.stopListening();

// Perform maintenance or updates
await updateWalletConfiguration();

// Resume discovery
announcer.startListening();
```

##### Since

0.1.0

### Other

#### cleanup()

> **cleanup**(): `void`

Cleanup resources and stop listening.

##### Returns

`void`

***

#### getStats()

> **getStats**(): `object`

Get announcer statistics.

##### Returns

`object`

###### capabilityDetails

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

###### isListening

> **isListening**: `boolean`

###### responderInfo

> **responderInfo**: `object`

###### responderInfo.featureCount

> **featureCount**: `number`

###### responderInfo.id

> **id**: `string`

###### responderInfo.name

> **name**: `string`

###### responderInfo.rdns

> **rdns**: `string`

###### responderInfo.technologyCount

> **technologyCount**: `number`

###### responderInfo.type

> **type**: `ResponderType`

###### securityStats

> **securityStats**: `object`

###### securityStats.activeOrigins

> **activeOrigins**: `number`

###### securityStats.averageRequestsPerOrigin

> **averageRequestsPerOrigin**: `number`

###### securityStats.memoryUsage

> **memoryUsage**: `object`

###### securityStats.memoryUsage.requestMaps

> **requestMaps**: `number`

###### securityStats.memoryUsage.totalRequestEntries

> **totalRequestEntries**: `number`

###### securityStats.rateLimitedOrigins

> **rateLimitedOrigins**: `number`

###### securityStats.totalOrigins

> **totalOrigins**: `number`

###### securityStats.totalRequests

> **totalRequests**: `number`

###### securityStats.usedSessionsCount

> **usedSessionsCount**: `number`
