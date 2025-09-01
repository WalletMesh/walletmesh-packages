[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / CapabilityMatcher

# Class: CapabilityMatcher

Defined in: [responder/CapabilityMatcher.ts:125](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/responder/CapabilityMatcher.ts#L125)

Capability matcher implementing privacy-preserving intersection algorithm.

The CapabilityMatcher is responsible for determining if a wallet can fulfill
a dApp's requirements by comparing the wallet's capabilities against the
requested capabilities across all three categories:

1. **Chains**: Blockchain network compatibility
2. **Features**: Wallet functionality matching
3. **Interfaces**: API standard compatibility

The matcher implements a privacy-preserving approach that only reveals
capabilities that were explicitly requested, preventing enumeration attacks.

Key principles:
- **All-or-nothing matching**: ALL required capabilities must be supported
- **Privacy preservation**: Never reveals unrequested capabilities
- **Three-part validation**: Chains, features, and interfaces are all checked
- **Intersection calculation**: Returns only the overlap of requested vs supported

## Examples

```typescript
const matcher = new CapabilityMatcher(myWalletInfo);

const request = {
  required: {
    chains: ['eip155:1'],                    // Must support Ethereum
    features: ['account-management'],         // Must have account management
    interfaces: ['eip-1193']                 // Must implement EIP-1193
  }
};

const result = matcher.matchCapabilities(request);

if (result.canFulfill) {
  // Wallet supports ALL required capabilities
  console.log('Matched capabilities:', result.intersection);
} else {
  // Wallet missing some requirements
  console.log('Missing chains:', result.missing.chains);
  console.log('Missing features:', result.missing.features);
  console.log('Missing interfaces:', result.missing.interfaces);
}
```

```typescript
const request = {
  required: {
    chains: ['eip155:1'],
    features: ['account-management', 'transaction-signing'],
    interfaces: ['eip-1193']
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

 - [DiscoveryResponder](DiscoveryResponder.md) for integration with announcer
 - [CapabilityMatchResult](../interfaces/CapabilityMatchResult.md) for result structure
 - [CapabilityRequirements](../interfaces/CapabilityRequirements.md) for requirement structure

## Constructors

### Constructor

> **new CapabilityMatcher**(`responderInfo`): `CapabilityMatcher`

Defined in: [responder/CapabilityMatcher.ts:128](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/responder/CapabilityMatcher.ts#L128)

#### Parameters

##### responderInfo

[`ResponderInfo`](../type-aliases/ResponderInfo.md)

#### Returns

`CapabilityMatcher`

## Capability

### matchCapabilities()

> **matchCapabilities**(`request`): [`CapabilityMatchResult`](../interfaces/CapabilityMatchResult.md)

Defined in: [responder/CapabilityMatcher.ts:179](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/responder/CapabilityMatcher.ts#L179)

Check if responder can fulfill initiator requirements and generate intersection.

Performs comprehensive capability matching to determine if the responder
can satisfy ALL required capabilities. If qualified, generates a
privacy-preserving intersection response.

Algorithm:
1. Validate request structure and required fields
2. Check if ALL required capabilities are supported
3. If qualified, calculate intersection of requested vs. supported
4. Include optional capability intersections if present
5. Return result with qualification status and intersection

#### Parameters

##### request

[`DiscoveryRequestEvent`](../interfaces/DiscoveryRequestEvent.md)

Capability request from initiator

#### Returns

[`CapabilityMatchResult`](../interfaces/CapabilityMatchResult.md)

Matching result with qualification and intersection

#### Example

```typescript
const request: DiscoveryRequestEvent = {
  type: 'wallet:discovery:capability-request',
  version: '0.1.0',
  sessionId: 'session-uuid',
  timestamp: Date.now(),
  required: {
    chains: ['eip155:1'],
    features: ['account-management'],
    interfaces: ['eip-1193']
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

#### Since

0.1.0

## Other

### getCapabilityDetails()

> **getCapabilityDetails**(): `object`

Defined in: [responder/CapabilityMatcher.ts:262](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/responder/CapabilityMatcher.ts#L262)

Get detailed capability information for debugging.

#### Returns

`object`

##### chainCount

> **chainCount**: `number`

##### featureCount

> **featureCount**: `number`

##### responderType

> **responderType**: [`ResponderType`](../type-aliases/ResponderType.md)

##### supportedChains

> **supportedChains**: `string`[]

##### supportedFeatures

> **supportedFeatures**: `string`[]

##### supportedInterfaces

> **supportedInterfaces**: `string`[]

***

### updateResponderInfo()

> **updateResponderInfo**(`responderInfo`): `void`

Defined in: [responder/CapabilityMatcher.ts:255](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/responder/CapabilityMatcher.ts#L255)

Update the responder information.

#### Parameters

##### responderInfo

[`ResponderInfo`](../type-aliases/ResponderInfo.md)

#### Returns

`void`
