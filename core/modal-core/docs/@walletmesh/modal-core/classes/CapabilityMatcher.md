[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / CapabilityMatcher

# Class: CapabilityMatcher

Capability matcher implementing privacy-preserving intersection algorithm.

The CapabilityMatcher is responsible for determining if a wallet can fulfill
a dApp's requirements by comparing the wallet's capabilities against the
requested capabilities using technology-based matching:

1. **Technologies**: Blockchain technology support with interfaces/features
2. **Features**: Global wallet functionality matching

The matcher implements a privacy-preserving approach that only reveals
capabilities that were explicitly requested, preventing enumeration attacks.

Key principles:
- **All-or-nothing matching**: ALL required capabilities must be supported
- **Privacy preservation**: Never reveals unrequested capabilities
- **Technology-based validation**: Technologies with interfaces and features are checked
- **Intersection calculation**: Returns only the overlap of requested vs supported

## Examples

```typescript
const matcher = new CapabilityMatcher(myWalletInfo);

const request = {
  required: {
    technologies: [
      {
        type: 'evm',
        interfaces: ['eip-1193'],              // Must implement EIP-1193
        features: ['eip-712']                  // Must support EIP-712
      }
    ],
    features: ['account-management']           // Must have account management
  }
};

const result = matcher.matchCapabilities(request);

if (result.canFulfill) {
  // Wallet supports ALL required capabilities
  console.log('Matched capabilities:', result.intersection);
} else {
  // Wallet missing some requirements
  console.log('Missing technologies:', result.missing.technologies);
  console.log('Missing features:', result.missing.features);
}
```

```typescript
const request = {
  required: {
    technologies: [
      {
        type: 'evm',
        interfaces: ['eip-6963', 'eip-1193'],  // Prefer EIP-6963
        features: ['eip-712', 'personal-sign']
      }
    ],
    features: ['account-management', 'transaction-signing']
  },
  optional: {
    features: ['hardware-wallet', 'batch-transactions']
  }
};

const result = matcher.matchCapabilities(request);
// Result includes both required matches and any optional matches
```

## Since

0.1.0

## See

 - [DiscoveryResponder](../interfaces/DiscoveryResponder.md) for integration with announcer
 - [CapabilityMatchResult](../interfaces/CapabilityMatchResult.md) for result structure
 - [CapabilityRequirements](../interfaces/CapabilityRequirements.md) for requirement structure

## Constructors

### Constructor

> **new CapabilityMatcher**(`responderInfo`): `CapabilityMatcher`

#### Parameters

##### responderInfo

[`ResponderInfo`](../type-aliases/ResponderInfo.md)

#### Returns

`CapabilityMatcher`

## Methods

### Capability

#### matchCapabilities()

> **matchCapabilities**(`request`): [`CapabilityMatchResult`](../interfaces/CapabilityMatchResult.md)

Check if responder can fulfill initiator requirements and generate intersection.

Performs comprehensive capability matching to determine if the responder
can satisfy ALL required capabilities. If qualified, generates a
privacy-preserving intersection response.

Algorithm:
1. Validate request structure and required fields
2. Check if ALL required technologies are supported with matching interfaces
3. Check if ALL required global features are supported
4. If qualified, calculate intersection of requested vs. supported
5. Return result with qualification status and intersection

##### Parameters

###### request

[`DiscoveryRequestEvent`](../interfaces/DiscoveryRequestEvent.md)

Capability request from initiator

##### Returns

[`CapabilityMatchResult`](../interfaces/CapabilityMatchResult.md)

Matching result with qualification and intersection

##### Example

```typescript
const request: DiscoveryRequestEvent = {
  type: 'discovery:wallet:request',
  version: '0.1.0',
  sessionId: 'session-uuid',
  required: {
    technologies: [{
      type: 'evm',
      interfaces: ['eip-6963', 'eip-1193'],
      features: ['eip-712']
    }],
    features: ['account-management']
  },
  origin: 'https://initiator.com',
  initiatorInfo: { } // initiator metadata
};

const result = matcher.matchCapabilities(request);

if (result.canFulfill) {
  // Responder qualifies - send response with intersection
  const response = {
    // ... other response fields
    matched: result.intersection
  };
}
```

##### Since

0.1.0

### Other

#### getCapabilityDetails()

> **getCapabilityDetails**(): `object`

Get detailed capability information for debugging.

##### Returns

`object`

###### featureCount

> **featureCount**: `number`

###### responderType

> **responderType**: `ResponderType`

###### supportedFeatures

> **supportedFeatures**: `string`[]

###### supportedInterfaces

> **supportedInterfaces**: `string`[]

###### supportedTechnologies

> **supportedTechnologies**: `string`[]

###### technologyCount

> **technologyCount**: `number`

***

#### updateResponderInfo()

> **updateResponderInfo**(`responderInfo`): `void`

Update the responder information.

##### Parameters

###### responderInfo

[`ResponderInfo`](../type-aliases/ResponderInfo.md)

##### Returns

`void`
