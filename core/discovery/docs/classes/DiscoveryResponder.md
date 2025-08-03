[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryResponder

# Class: DiscoveryResponder

Defined in: [responder/DiscoveryResponder.ts:80](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/responder/DiscoveryResponder.ts#L80)

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
    chains: [], // supported chains
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
 - [CapabilityMatcher](CapabilityMatcher.md) for capability intersection logic
 - [OriginValidator](OriginValidator.md) for security validation

## Constructors

### Constructor

> **new DiscoveryResponder**(`config`): `DiscoveryResponder`

Defined in: [responder/DiscoveryResponder.ts:93](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/responder/DiscoveryResponder.ts#L93)

#### Parameters

##### config

[`DiscoveryResponderConfig`](../interfaces/DiscoveryResponderConfig.md)

#### Returns

`DiscoveryResponder`

## Configuration

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [responder/DiscoveryResponder.ts:267](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/responder/DiscoveryResponder.ts#L267)

Update announcer configuration without restarting.

Partially updates the configuration while maintaining the current
listening state. Useful for adjusting security policies or
session settings during runtime.

#### Parameters

##### config

`Partial`\<[`DiscoveryResponderConfig`](../interfaces/DiscoveryResponderConfig.md)\>

Partial configuration updates

#### Returns

`void`

#### Example

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

#### Since

0.1.0

***

### updateResponderInfo()

> **updateResponderInfo**(`responderInfo`): `void`

Defined in: [responder/DiscoveryResponder.ts:234](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/responder/DiscoveryResponder.ts#L234)

Update responder information while maintaining discovery state.

Updates the responder's capabilities and information used for
capability matching. The announcer continues listening with
the updated information.

#### Parameters

##### responderInfo

[`ResponderInfo`](../type-aliases/ResponderInfo.md)

New responder information

#### Returns

`void`

#### Example

```typescript
// Add support for a new blockchain
const updatedInfo = {
  ...currentResponderInfo,
  chains: [
    ...currentResponderInfo.chains,
    newChainCapability
  ]
};

announcer.updateResponderInfo(updatedInfo);
console.log('Responder now supports additional chains');
```

#### Since

0.1.0

## Discovery

### isAnnouncerListening()

> **isAnnouncerListening**(): `boolean`

Defined in: [responder/DiscoveryResponder.ts:203](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/responder/DiscoveryResponder.ts#L203)

Check if the announcer is currently listening for requests.

Returns the current listening state. Useful for UI indicators
and ensuring proper state management.

#### Returns

`boolean`

True if listening for requests, false otherwise

#### Example

```typescript
if (announcer.isAnnouncerListening()) {
  console.log('Wallet is discoverable');
} else {
  announcer.startListening();
  console.log('Started wallet discovery');
}
```

#### Since

0.1.0

***

### startListening()

> **startListening**(): `void`

Defined in: [responder/DiscoveryResponder.ts:135](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/responder/DiscoveryResponder.ts#L135)

Start listening for discovery requests from dApps.

Begins monitoring for discovery requests and automatically responds
to requests that match the wallet's capabilities. Safe to call
multiple times (idempotent).

Security checks performed on each request:
- Origin validation against security policy
- Rate limiting per origin
- Session replay prevention
- Capability intersection calculation

#### Returns

`void`

#### Example

```typescript
announcer.startListening();
console.log('Wallet is now discoverable');

// Wallet will automatically respond to qualified requests
// No manual intervention required
```

#### Since

0.1.0

***

### stopListening()

> **stopListening**(): `void`

Defined in: [responder/DiscoveryResponder.ts:167](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/responder/DiscoveryResponder.ts#L167)

Stop listening for discovery requests.

Stops monitoring for discovery requests and removes event listeners.
The wallet becomes undiscoverable until startListening() is called again.
Safe to call multiple times (idempotent).

#### Returns

`void`

#### Example

```typescript
// Temporarily hide wallet from discovery
announcer.stopListening();

// Perform maintenance or updates
await updateWalletConfiguration();

// Resume discovery
announcer.startListening();
```

#### Since

0.1.0

## Other

### cleanup()

> **cleanup**(): `void`

Defined in: [responder/DiscoveryResponder.ts:305](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/responder/DiscoveryResponder.ts#L305)

Cleanup resources and stop listening.

#### Returns

`void`

***

### getStats()

> **getStats**(): `object`

Defined in: [responder/DiscoveryResponder.ts:283](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/responder/DiscoveryResponder.ts#L283)

Get announcer statistics.

#### Returns

`object`

##### capabilityDetails

> **capabilityDetails**: `object`

###### capabilityDetails.chainCount

> **chainCount**: `number`

###### capabilityDetails.featureCount

> **featureCount**: `number`

###### capabilityDetails.responderType

> **responderType**: [`ResponderType`](../type-aliases/ResponderType.md)

###### capabilityDetails.supportedChains

> **supportedChains**: `string`[]

###### capabilityDetails.supportedFeatures

> **supportedFeatures**: `string`[]

###### capabilityDetails.supportedInterfaces

> **supportedInterfaces**: `string`[]

##### isListening

> **isListening**: `boolean`

##### responderInfo

> **responderInfo**: `object`

###### responderInfo.chainCount

> **chainCount**: `number`

###### responderInfo.featureCount

> **featureCount**: `number`

###### responderInfo.id

> **id**: `string`

###### responderInfo.name

> **name**: `string`

###### responderInfo.rdns

> **rdns**: `string`

###### responderInfo.type

> **type**: [`ResponderType`](../type-aliases/ResponderType.md)

##### securityStats

> **securityStats**: `object`

###### securityStats.activeOrigins

> **activeOrigins**: `number` = `0`

###### securityStats.averageRequestsPerOrigin

> **averageRequestsPerOrigin**: `number` = `0`

###### securityStats.memoryUsage

> **memoryUsage**: `object`

###### securityStats.memoryUsage.requestMaps

> **requestMaps**: `number`

###### securityStats.memoryUsage.totalRequestEntries

> **totalRequestEntries**: `number` = `0`

###### securityStats.rateLimitedOrigins

> **rateLimitedOrigins**: `number` = `0`

###### securityStats.totalOrigins

> **totalOrigins**: `number` = `origins.length`

###### securityStats.totalRequests

> **totalRequests**: `number` = `0`

###### securityStats.usedSessionsCount

> **usedSessionsCount**: `number`
